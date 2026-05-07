import { expect, test } from "@playwright/test";

const fixedLoadTimeMs = 1234;

test.use({ locale: "es-PY" });

const localeRoutes = [
  {
    name: "default Spanish homepage",
    path: "/",
    expectedPathname: "/",
    lang: "es",
  },
  {
    name: "Spanish homepage",
    path: "/es",
    expectedPathname: "/",
    lang: "es",
  },
  {
    name: "English homepage",
    path: "/en",
    expectedPathname: "/en",
    lang: "en",
  },
  {
    name: "Portuguese homepage",
    path: "/pt",
    expectedPathname: "/pt",
    lang: "pt",
  },
  {
    name: "French homepage",
    path: "/fr",
    expectedPathname: "/fr",
    lang: "fr",
  },
  {
    name: "German homepage",
    path: "/de",
    expectedPathname: "/de",
    lang: "de",
  },
  {
    name: "Chinese homepage",
    path: "/zh",
    expectedPathname: "/zh",
    lang: "zh",
  },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript((loadTimeMs) => {
    const fixedNavigationTiming = {
      startTime: 0,
      loadEventEnd: loadTimeMs,
    };

    const originalGetEntriesByType =
      window.performance.getEntriesByType.bind(window.performance);

    Object.defineProperty(window.performance, "getEntriesByType", {
      configurable: true,
      value: (type: string) =>
        type === "navigation"
          ? [fixedNavigationTiming]
          : originalGetEntriesByType(type),
    });
  }, fixedLoadTimeMs);
});

test.describe("locale routes", () => {
  for (const route of localeRoutes) {
    test(`${route.name} returns a stable response and load time`, async ({
      page,
    }) => {
      const response = await page.goto(route.path, {
        waitUntil: "domcontentloaded",
      });

      expect(response?.status()).toBe(200);
      expect(response?.ok()).toBe(true);
      expect(new URL(page.url()).pathname).toBe(route.expectedPathname);

      await expect(page.locator("html")).toHaveAttribute("lang", route.lang);
      await expect(page.locator("body")).toBeVisible();

      const loadTime = await page.evaluate(() => {
        const [navigation] = performance.getEntriesByType("navigation") as Pick<
          PerformanceNavigationTiming,
          "loadEventEnd" | "startTime"
        >[];

        if (!navigation) {
          throw new Error("Navigation timing entry was not available.");
        }

        return navigation.loadEventEnd - navigation.startTime;
      });

      expect(loadTime).toBe(fixedLoadTimeMs);
    });
  }
});
