/**
 * FileName: useFlightSearchMultiSegment.ts
 * Description: Custom hook for searching flights with multiple segments (multi-destination).
 *              Handles API calls to /travel-agencies/flights/search-multi-segment.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 12/05/2026 [Diego de la Vega] Created useFlightSearchMultiSegment hook for multi-segment flight queries.
 */

import { useQuery } from '@tanstack/react-query';
import { postRequest } from '../../utils/apiService';
import { UnifiedFlightOption } from './useFlightSearch';

export interface FlightSegmentInput {
  origin: string;
  destination: string;
  departure_date: string;
}

export interface FlightSearchMultiSegmentQuery {
  slices: FlightSegmentInput[];
  passengers: number;
}

export interface FlightSegmentResult {
  segment_index: number;
  route: string;
  results: UnifiedFlightOption[];
}

export interface FlightSearchMultiSegmentResponse {
  results_by_segment: FlightSegmentResult[];
  provider_errors: any[];
  query: FlightSearchMultiSegmentQuery;
  total_segments: number;
  providers_used: string[];
}

/**
 * FunctionName: searchFlightsMultiSegment
 * Description: Sends a POST request to search for flights with multiple segments.
 * Input: query (FlightSearchMultiSegmentQuery) - the search parameters with multiple slices.
 * Output: Promise resolving to FlightSearchMultiSegmentResponse.
 */
export async function searchFlightsMultiSegment(
  query: FlightSearchMultiSegmentQuery,
): Promise<FlightSearchMultiSegmentResponse> {
  // Duffel searches may take longer (polling for offers). Increase timeout for this request.
  return postRequest('/travel-agencies/flights/search-multi-segment', query, { timeout: 120000 });
}

/**
 * FunctionName: useFlightSearchMultiSegment
 * Description: React Query hook for managing multi-segment flight search state and caching.
 * Input: query (FlightSearchMultiSegmentQuery | null) - search parameters. Pass null to disable query.
 * Output: useQuery hook result with data, isLoading, error, etc.
 */
export function useFlightSearchMultiSegment(query: FlightSearchMultiSegmentQuery | null) {
  return useQuery({
    queryKey: ['flightSearchMultiSegment', query],
    queryFn: () => searchFlightsMultiSegment(query!),
    enabled: !!query,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
