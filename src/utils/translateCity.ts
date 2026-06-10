/**
 * FileName: translateCity.ts
 * Description: Provides a utility function for translating city names from English to the user's locale language, 
 * currently supporting Spanish translations. This function is used throughout the application to display city 
 * names in a localized manner based on the user's language preference.
 * Authors: Debug Studio
 * Last Modification made:
 * 02/06/2026 [Nicolas Quintana] Added description of the file for better documentation.
 */

const cityTranslations: Record<string, Record<string, string>> = {
  es: {
    "Mexico City": "Ciudad de México",
    "New York": "Nueva York",
    "New York City": "Nueva York",
    "London": "Londres",
    "Tokyo": "Tokio",
    "Beijing": "Pekín",
    "Moscow": "Moscú",
    "Athens": "Atenas",
    "Rome": "Roma",
    "Vienna": "Viena",
    "Lisbon": "Lisboa",
    "Cairo": "El Cairo",
    "Copenhagen": "Copenhague",
    "Warsaw": "Varsovia",
    "Stockholm": "Estocolmo",
    "Prague": "Praga",
    "Bucharest": "Bucarest",
    "Brussels": "Bruselas",
    "Seoul": "Seúl",
    "The Hague": "La Haya",
    "Geneva": "Ginebra",
    "Florence": "Florencia",
    "Venice": "Venecia",
    "Naples": "Nápoles",
    "Seville": "Sevilla",
    "Cologne": "Colonia",
    "Munich": "Múnich",
    "Zurich": "Zúrich",
  },
};

export function translateCity(englishName: string, locale: string): string {
  const lang = locale.split("-")[0] ?? "en";
  return cityTranslations[lang]?.[englishName] ?? englishName;
}
