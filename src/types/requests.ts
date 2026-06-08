/**
 * FileName: requests.ts
 * Description: Type definition for creating a new travel request. 
 * Represents the payload structure sent to the backend when submitting a travel request.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 20/04/2026 [Sebastián Borjas] Added support for advance money currency.
 */

import { RequestDestination } from "./requestDestinations";

/**
 * CreateRequest, represents the payload required to create a travel request.
 * Input:
 * - id_origin_city (string): Identifier of the origin city for the trip.
 * - title (string): Title of the travel request.
 * - motive (string): Purpose or justification for the trip.
 * - requirements (string | undefined): Optional additional requirements or notes.
 * - priority ("alta" | "media" | "baja"): Priority level assigned to the request.
 * - requests_destinations (RequestDestination[]): Ordered list of destinations associated with the trip.
 * Output: CreateRequest type - Used when sending POST requests to create a new travel request.
 */
export type CreateRequest = {
  id_origin_city: string;
  title: string;
  motive: string;
  requirements?: string;
  priority: "alta" | "media" | "baja";
  advance_money?: number;
  unconverted_advance_money?: number;
  currency: string;
  requests_destinations: RequestDestination[];
};
