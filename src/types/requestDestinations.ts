/**
 * requestDestination.ts
 * Description: Type definition for a destination associated with a travel request. 
 * Represents the structure sent to or received from the backend when managing multi-destination trips.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * RequestDestination, represents a single destination entry within a travel request.
 * Input:
 * - id_destination (string): Unique identifier of the destination.
 * - destination_order (number): Order index of the destination within the trip (used for sequencing).
 * - stay_days (number): Number of days the traveler will stay at this destination.
 * - arrival_date (string): Arrival date in ISO-8601 format.
 * - departure_date (string): Departure date in ISO-8601 format.
 * - is_hotel_required (boolean): Indicates whether hotel reservation is required.
 * - is_plane_required (boolean): Indicates whether flight reservation is required.
 * - is_last_destination (boolean): Indicates if this destination is the final stop in the trip.
 * - details (string | undefined): Optional additional notes or special instructions.
 * Output: RequestDestination type - Used for API payloads and business logic related to travel request destinations.
 */
export type RequestDestination = {
  id_destination: string;
  destination_order: number;
  stay_days: number;
  arrival_date: string; // ISO-8601
  departure_date: string; // ISO-8601
  is_hotel_required: boolean;
  is_plane_required: boolean;
  is_last_destination: boolean;
  details?: string;
};