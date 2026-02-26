/**
 * FileName: useDestinations.ts
 * Description: Defines a custom hook for fetching destination data, utilizing React Query's useQuery to handle the API call and manage the state of the data fetching process, including loading and error states, and transforming the data into a format suitable for use in UI components.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */
import { useQuery } from "@tanstack/react-query";
import { getRequest } from "../../utils/apiService";
import { Destination, DestinationOption } from "../../types/destinations";

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
 * Output: an object containing the destinations data, loading state, and error state.
 */
export function useDestinations() {
  const {
    data: destinations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
  });

  // Transform destinations into options format for the Select component
  // Ensure destinations is an array before mapping
  const destinationOptions: DestinationOption[] = Array.isArray(destinations)
    ? destinations.map((dest) => ({
        id: dest.id,
        name: `${dest.city}, ${dest.country}`,
      }))
    : [];

  return {
    destinations: Array.isArray(destinations) ? destinations : [],
    destinationOptions,
    isLoading,
    error,
  };
}
