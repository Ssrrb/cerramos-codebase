import { expect, type Page, test } from "@playwright/test";

test.use({ locale: "es-PY" });

const pageOpenBudgetMs = process.env.CI ? 30_000 : 20_000;
const imageLoadBudgetMs = process.env.CI ? 20_000 : 12_000;
const interactionBudgetMs = process.env.CI ? 8_000 : 5_000;
const checkoutBaseUrl =
  process.env.PLAYWRIGHT_CHECKOUT_BASE_URL ?? "http://localhost:3001";
const checkoutImageSvg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">',
  '<rect width="640" height="480" fill="#111827"/>',
  '<rect x="72" y="72" width="496" height="336" rx="32" fill="#f8fafc"/>',
  '<circle cx="248" cy="220" r="72" fill="#93c5fd"/>',
  '<path d="M136 368 284 252l92 76 64-52 88 92H136Z" fill="#16a34a"/>',
  "</svg>",
].join("");

const checkoutRoutes = [
  {
    expectedPathname: "/buy/tutienda/campera-tutienda",
    lang: "es",
    name: "campera Spanish checkout",
    path: "/es/buy/tutienda/campera-tutienda",
    productName: /campera/i,
  },
] as const;

const getElapsedTime = (startedAt: number) =>
  Math.round(performance.now() - startedAt);

const getNavigationMetrics = async (page: Page) =>
  page.evaluate(() => {
    const [navigation] = performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];

    if (!navigation) {
      throw new Error("Navigation timing entry was not available.");
    }

    return {
      domContentLoadedMs: Math.round(
        navigation.domContentLoadedEventEnd - navigation.startTime
      ),
      responseEndMs: Math.round(navigation.responseEnd - navigation.startTime),
    };
  });

const waitForCheckoutImage = async (
  page: Page,
  productName: RegExp
) => {
  const productImage = page.getByRole("img", { name: productName }).first();

  await expect(productImage).toBeVisible({ timeout: imageLoadBudgetMs });
  await expect
    .poll(
      () =>
        productImage.evaluate((image) => {
          const img = image as HTMLImageElement;

          return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
        }),
      {
        message: "product image should finish loading",
        timeout: imageLoadBudgetMs,
      }
    )
    .toBe(true);

  const imageSrc = await productImage.getAttribute("src");
  const imageTiming = await page.evaluate((src) => {
    if (!src) {
      return null;
    }

    const absoluteSrc = new URL(src, window.location.href).href;
    const imageEntry = (
      performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    )
      .filter((entry) => entry.initiatorType === "img")
      .find((entry) => entry.name === absoluteSrc);

    if (!imageEntry) {
      return null;
    }

    return {
      durationMs: Math.round(imageEntry.duration),
      responseEndMs: Math.round(imageEntry.responseEnd),
    };
  }, imageSrc);

  if (imageTiming) {
    expect(imageTiming.durationMs).toBeLessThan(imageLoadBudgetMs);
  }

  return imageTiming;
};

const mockCheckoutProductImage = async (page: Page) => {
  await page.route("**/api/product-link-images?**", async (route) => {
    await route.fulfill({
      body: checkoutImageSvg,
      contentType: "image/svg+xml",
      status: 200,
    });
  });
};

const selectCheckoutOption = async (
  page: Page,
  label: string,
  optionName: string
) => {
  await page.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: optionName }).click();
};

const interactWithCheckout = async (page: Page) => {
  const quantityStartedAt = performance.now();

  await page.getByRole("button", { name: /aumentar cantidad/i }).click();
  await expect(page.getByText("Gs. 400.000").first()).toBeVisible({
    timeout: interactionBudgetMs,
  });

  const quantityInteractionMs = getElapsedTime(quantityStartedAt);
  expect(quantityInteractionMs).toBeLessThan(interactionBudgetMs);

  const detailsStartedAt = performance.now();

  await page.getByLabel("Nombre y apellido").fill("Camila Ferreira");
  await page.getByLabel("Email").fill("camila@example.com");
  await page.getByLabel("Teléfono").fill("0981123456");
  await page
    .getByRole("button", { name: /continuar a (entrega|coordinación|pago)/i })
    .click();

  await expect(
    page.getByRole("heading", { name: /entrega|pago/i })
  ).toBeVisible({ timeout: interactionBudgetMs });

  const detailsInteractionMs = getElapsedTime(detailsStartedAt);
  expect(detailsInteractionMs).toBeLessThan(interactionBudgetMs);

  const isPaymentStepVisible = await page
    .getByRole("heading", { name: /pago/i })
    .isVisible()
    .catch(() => false);

  if (isPaymentStepVisible) {
    return {
      deliveryInteractionMs: 0,
      detailsInteractionMs,
      quantityInteractionMs,
    };
  }

  const deliveryStartedAt = performance.now();

  await selectCheckoutOption(page, "Departamento", "Asunción");
  await selectCheckoutOption(page, "Ciudad", "Asunción");
  await page.getByLabel("Dirección").fill("Av. España 742");
  await page.getByLabel("Referencia").fill("Portón negro");
  await page.getByRole("button", { name: /continuar a pago/i }).click();

  await expect(page.getByRole("heading", { name: /pago/i })).toBeVisible({
    timeout: interactionBudgetMs,
  });
  await expect(
    page.getByRole("button", { name: /confirmar pedido/i })
  ).toBeVisible({ timeout: interactionBudgetMs });

  const deliveryInteractionMs = getElapsedTime(deliveryStartedAt);
  expect(deliveryInteractionMs).toBeLessThan(interactionBudgetMs);

  return {
    deliveryInteractionMs,
    detailsInteractionMs,
    quantityInteractionMs,
  };
};

test.describe("checkout dynamic routes", () => {
  for (const route of checkoutRoutes) {
    test(`${route.name} opens quickly, loads the image, and stays interactive`, async ({
      page,
    }, testInfo) => {
      await mockCheckoutProductImage(page);

      const pageStartedAt = performance.now();
      const imageResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/product-link-images") &&
          response.request().resourceType() === "image",
        { timeout: imageLoadBudgetMs }
      );

      const response = await page.goto(
        new URL(route.path, checkoutBaseUrl).toString(),
        {
          waitUntil: "domcontentloaded",
        }
      );
      const pageOpenMs = getElapsedTime(pageStartedAt);

      expect(response?.status()).toBe(200);
      expect(response?.ok()).toBe(true);
      expect(new URL(page.url()).pathname).toBe(route.expectedPathname);
      expect(pageOpenMs).toBeLessThan(pageOpenBudgetMs);

      await expect(page.locator("html")).toHaveAttribute("lang", route.lang);
      await expect(page.locator("body")).toContainText(route.productName);
      await expect(
        page.getByRole("heading", { name: /mis datos/i })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /continuar a (entrega|pago)/i })
      ).toBeVisible();
      await expect(page.getByText("Powered by Cheki")).toBeVisible();

      const imageResponse = await imageResponsePromise;
      expect(imageResponse.ok()).toBe(true);
      expect(imageResponse.headers()["content-type"]).toMatch(/^image\//);

      const imageTiming = await waitForCheckoutImage(page, route.productName);
      const imageLoadedMs = getElapsedTime(pageStartedAt);
      expect(imageLoadedMs).toBeLessThan(imageLoadBudgetMs);

      await page.waitForLoadState("load");

      const interactionTimings = await interactWithCheckout(page);
      const navigationTimings = await getNavigationMetrics(page);

      await testInfo.attach(`${route.name}-timings.json`, {
        body: JSON.stringify(
          {
            budgets: {
              imageLoadBudgetMs,
              interactionBudgetMs,
              pageOpenBudgetMs,
            },
            measured: {
              imageLoadedMs,
              imageTiming,
              navigationTimings,
              pageOpenMs,
              ...interactionTimings,
            },
            path: route.path,
          },
          null,
          2
        ),
        contentType: "application/json",
      });
    });
  }
});
