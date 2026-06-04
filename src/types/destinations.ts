/**
 * FileName: destinations.ts
 * Description: Type definitions related to destination entities used across the application (API models and UI select options).
 * Authors: Original Moncarca team
 * Last Modification made:
 * 02/06/2026 [Nicolas Quintana] Removed comment redundancies.
 */

/**
 * Destination, represents a destination entity returned by the backend API.
 * Input:
 * - id (string): Unique identifier of the destination.
 * - country (string): Country where the destination is located.
 * - city (string): City name of the destination.
 * - iata_code (string | null | undefined): Optional IATA airport code.
 * - airport_name (string | null | undefined): Optional airport display name.
 * Output: Destination interface - Used to type API responses and business logic related to destinations.
 */
export interface Destination {
  id: string;
  country: string;
  city: string;
  iata_code?: string | null;
  airport_name?: string | null;
}

/**
 * DestinationOption, represents a simplified destination object used in UI components (e.g., Select dropdown).
 * Input:
 * - id (string): Unique identifier of the destination.
 * - name (string): Display name shown in the UI (typically formatted as "City, Country").
 * - iata_code (string | null | undefined): Optional IATA airport code for UI fallback display.
 * - airport_name (string | null | undefined): Optional airport name for UI fallback display.
 * - airport_ids (string[] | undefined): Optional list of airport destination ids
 *   grouped under the same city option.
 * Output: DestinationOption type - Used for dropdowns and selection components.
 */
export type DestinationOption = {
  id: string;
  name: string;
  iata_code?: string | null;
  airport_name?: string | null;
  airport_ids?: string[];
};
