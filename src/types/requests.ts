/**
 * requests.ts
 * Description: Type definition for creating a new travel request. 
 * Represents the payload structure sent to the backend when submitting a travel request.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
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
  requests_destinations: RequestDestination[];
};
