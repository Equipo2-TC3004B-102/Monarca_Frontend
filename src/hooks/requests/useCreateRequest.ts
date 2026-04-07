/**
 * FileName: useCreateRequest.ts
 * Description: Defines a custom hook for creating new travel requests, utilizing React Query's useMutation to handle the API call and manage the state of the request creation process, including error handling and cache invalidation for updated data fetching.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */
import { CreateRequest } from "../../types/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postRequest } from "../../utils/apiService";
import { AxiosError } from "axios";

/**
 * FunctionName: createRequest, sends a POST request to create a new travel request.
 * Input: payload (CreateRequest) - the data for the new travel request.
 * Output: Promise resolving to the API response for the created travel request.
 */
export async function createRequest(payload: CreateRequest) {
  return postRequest("/requests", payload);
}

/**
 * FunctionName: useCreateTravelRequest, returns a mutation function for creating a new travel request and a boolean indicating if the operation is pending.
 * Input: none
 * Output: an object containing the mutation function and a boolean indicating if the operation is pending.
 */
export function useCreateTravelRequest() {
  const queryClient = useQueryClient();

  const { mutateAsync: createTravelRequestMutation, isPending } = useMutation({
    mutationFn: (payload: CreateRequest) => createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travelRequests"] });
    },
    onError: (error: AxiosError) => {
      console.error("Error creating travel request:", error);
      throw error;
    },
  });

  return { createTravelRequestMutation, isPending };
}
