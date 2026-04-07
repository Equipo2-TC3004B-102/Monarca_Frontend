/**
 * FileName: useGetRequest.ts
 * Description: Defines a custom hook for fetching a specific travel request by its ID, utilizing React Query's useQuery to handle the API call and manage the state of the data fetching process, including loading and error states.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */
import { useQuery } from "@tanstack/react-query";
import { getRequest } from "../../utils/apiService";
import { CreateRequest } from "../../types/requests";

/**
 * FunctionName: fetchTravelRequest, fetches a specific travel request by its ID.
 * Input: id (string) - the unique identifier of the travel request to fetch.
 * Output: Promise resolving to the fetched travel request data.
 */
export async function fetchTravelRequest(id: string): Promise<CreateRequest> {
  return getRequest(`/requests/${id}`);
}

/**
 * FunctionName: useGetRequest, returns a query object for fetching a specific travel request by its ID.
 * Input: id (string) - the unique identifier of the travel request to fetch.
 * Output: a query object that can be used with React Query to fetch and manage the state of the travel request data.
 */
export function useGetRequest(id: string) {
  return useQuery({
    queryKey: ["travelRequest", id],
    queryFn: () => fetchTravelRequest(id),
    enabled: !!id,
  });
}
