/**
 * FileName: useFlightSearch.ts
 * Description: Custom hook for searching flights with a single round trip or one-way.
 *              Handles API calls to /travel-agencies/flights/search.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 12/05/2026 [Diego de la Vega] Created useFlightSearch hook for single-segment flight queries.
 */

import { useQuery } from '@tanstack/react-query';
import { postRequest } from '../../utils/apiService';

export interface FlightSearchQuery {
  origin_airport_code: string;
  destination_airport_code: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
}

export interface UnifiedFlightOption {
  provider_offer_id: string;
  provider_id: string;
  provider_name: string;
  total_price_mxn: number;
  original_price: number;
  original_currency: string;
  airline?: string;
  stops: number;
  segments: FlightSegment[];
}

export interface FlightSegment {
  origin_airport_code: string;
  origin_city: string;
  destination_airport_code: string;
  destination_city: string;
  departure_at: string;
  arrival_at: string;
}

export interface FlightSearchResponse {
  results: UnifiedFlightOption[];
  provider_errors: any[];
  query: FlightSearchQuery;
  results_count: number;
  providers_used: string[];
  partial_success: boolean;
}

/**
 * FunctionName: searchFlights
 * Description: Sends a POST request to search for flights with a single query (one-way or round-trip).
 * Input: query (FlightSearchQuery) - the search parameters.
 * Output: Promise resolving to FlightSearchResponse.
 */
export async function searchFlights(query: FlightSearchQuery): Promise<FlightSearchResponse> {
  // Duffel searches can take longer due to polling; increase timeout for safety.
  return postRequest('/travel-agencies/flights/search', query, { timeout: 120000 });
}

/**
 * FunctionName: useFlightSearch
 * Description: React Query hook for managing flight search state and caching.
 * Input: query (FlightSearchQuery | null) - search parameters. Pass null to disable query.
 * Output: useQuery hook result with data, isLoading, error, etc.
 */
export function useFlightSearch(query: FlightSearchQuery | null) {
  return useQuery({
    queryKey: ['flightSearch', query],
    queryFn: () => searchFlights(query!),
    enabled: !!query,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
