/**
 * FileName: useDestinations.ts
 * Description: Defines a custom hook for fetching destination data, utilizing React Query's useQuery to handle the API call and manage the state of the data fetching process, including loading and error states, and transforming the data into a format suitable for use in UI components.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 03/06/2026 [Nicolas Quintana] Removed "Last Modification made" redundancies.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getRequest } from "../../utils/apiService";
import { Destination, DestinationOption } from "../../types/destinations";
import { translateCountry } from "../../utils/translateCountry";
import { translateCity } from "../../utils/translateCity";

/**
 * FunctionName: fetchDestinations, fetches all destination data from the API.
 * Input: none
 * Output: Promise resolving to an array of Destination objects.
 */
async function fetchDestinations(): Promise<Destination[]> {
  return getRequest("/destinations");
}

/**
 * FunctionName: useDestinations, returns a query object for fetching all destination data.
 * Input: none
 * Output: an object containing the destinations data, loading state, error state,
 *         and UI options with fallback labels when city/country is missing.
 */
export function useDestinations() {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const {
    data: destinations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
  });

  // Transform destinations into options format for the Select component
  // Ensure destinations is an array before grouping
  const destinationOptions: DestinationOption[] = useMemo(() => {
    if (!Array.isArray(destinations)) {
      return [];
    }

    const groupedByCity = new Map<string, DestinationOption>();

    for (const dest of destinations) {
      const city = dest.city?.trim();
      const country = dest.country?.trim();

      if (city && country) {
        const groupKey = `${city.toLowerCase()}|${country.toLowerCase()}`;
        const existing = groupedByCity.get(groupKey);

        if (existing) {
          existing.airport_ids = [...(existing.airport_ids || []), dest.id];
          if (!existing.iata_code && dest.iata_code) {
            existing.iata_code = dest.iata_code;
          }
          if (!existing.airport_name && dest.airport_name) {
            existing.airport_name = dest.airport_name;
          }
          continue;
        }

        const translatedCity = translateCity(city, locale);
        const translatedCountry = translateCountry(country, locale);
        groupedByCity.set(groupKey, {
          id: dest.id,
          name: `${translatedCity}, ${translatedCountry}`,
          iata_code: dest.iata_code,
          airport_name: dest.airport_name,
          airport_ids: [dest.id],
        });
        continue;
      }

      const fallbackName =
        dest.city || dest.country || dest.iata_code || "Destino sin nombre";
      groupedByCity.set(`id:${dest.id}`, {
        id: dest.id,
        name: fallbackName,
        iata_code: dest.iata_code,
        airport_name: dest.airport_name,
        airport_ids: [dest.id],
      });
    }

    return Array.from(groupedByCity.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
    );
  }, [destinations, locale]);

  return {
    destinations: Array.isArray(destinations) ? destinations : [],
    destinationOptions,
    isLoading,
    error,
  };
}
