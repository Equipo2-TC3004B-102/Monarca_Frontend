/**
 * FileName: useUpdateRequest.ts
 * Description: Defines a custom hook for updating existing travel requests, utilizing React Query's useMutation to handle the API call and manage the state of the request updating process, including error handling and cache invalidation for updated data fetching.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */
import { CreateRequest } from "../../types/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putRequest } from "../../utils/apiService";
import { AxiosError } from "axios";

/**
 * FunctionName: updateRequest, sends a PUT request to update an existing travel request.
 * Input: requestId (string) - the unique identifier of the travel request to update.
 *        payload (CreateRequest) - the updated data for the travel request.
 * Output: Promise resolving to the API response for the updated travel request.
 */
export async function updateRequest(requestId: string, payload: CreateRequest) {
  return putRequest(`/requests/${requestId}`, payload);
}

/**
 * FunctionName: useUpdateTravelRequest, returns a mutation function for updating an existing travel request and a boolean indicating if the operation is pending.
 * Input: none
 * Output: an object containing the mutation function and a boolean indicating if the operation is pending.
 */
export function useUpdateTravelRequest() {
  const queryClient = useQueryClient();

  const { mutateAsync: updateTravelRequestMutation, isPending } = useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: CreateRequest;
    }) => updateRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travelRequests"] });
    },
    onError: (error: AxiosError) => {
      console.error("Error updating travel request:", error);
      throw error;
    },
  });

  return { updateTravelRequestMutation, isPending };
}
