import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import esLocale from "i18n-iso-countries/langs/es.json";

countries.registerLocale(enLocale);
countries.registerLocale(esLocale);

export function translateCountry(englishName: string, locale: string): string {
  const lang = locale.split("-")[0];
  const code = countries.getAlpha2Code(englishName, "en");
  if (!code) return englishName;
  return countries.getName(code, lang) ?? englishName;
}
