import "server-only";
import type en from "./dictionaries/en.json";
import languine from "./languine.json" with { type: "json" };

const defaultLocale = languine.locale.source;

export const locales = [
  languine.locale.source,
  ...languine.locale.targets,
] as const;

export type Dictionary = typeof en;

const dictionaries: Record<string, () => Promise<Dictionary>> =
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      () =>
        import(`./dictionaries/${locale}.json`)
          .then((mod) => mod.default)
          .catch((_err) =>
            import(`./dictionaries/${defaultLocale}.json`).then(
              (mod) => mod.default
            )
          ),
    ])
  );

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const normalizedLocale = locale.split("-")[0];

  if (!locales.includes(normalizedLocale as (typeof locales)[number])) {
    return dictionaries[defaultLocale]();
  }

  try {
    return await dictionaries[normalizedLocale]();
  } catch (_error) {
    return dictionaries[defaultLocale]();
  }
};
