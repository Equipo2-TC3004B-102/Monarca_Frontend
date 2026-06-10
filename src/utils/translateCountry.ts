/**
 * FileName: translateCountry.ts
 * Description: Provides a utility function for translating country names from 
 * English to the user's locale language using the i18n-iso-countries library. 
 * This function is used throughout the application to display country names 
 * in a localized manner based on the user's language preference.
 * Authors: Debug Studio
 * Last Modification made:
 * 02/06/2026 [Nicolas Quintana] Added description of the file for better documentation.
 */

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import esLocale from "i18n-iso-countries/langs/es.json";

countries.registerLocale(enLocale);
countries.registerLocale(esLocale);

// Translates an English country name to the specified locale language using i18n-iso-countries.
export function translateCountry(englishName: string, locale: string): string {
  const lang = locale.split("-")[0] ?? "en";
  const code = countries.getAlpha2Code(englishName, "en");
  if (!code) return englishName;
  return countries.getName(code, lang) ?? englishName;
}
