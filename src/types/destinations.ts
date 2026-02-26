/**
 * destinations.ts
 * Description: Type definitions related to destination entities used across the application (API models and UI select options).
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * Destination, represents a destination entity returned by the backend API.
 * Input:
 * - id (string): Unique identifier of the destination.
 * - country (string): Country where the destination is located.
 * - city (string): City name of the destination.
 * Output: Destination interface - Used to type API responses and business logic related to destinations.
 */
export interface Destination {
  id: string;
  country: string;
  city: string;
}

/**
 * DestinationOption, represents a simplified destination object used in UI components (e.g., Select dropdown).
 * Input:
 * - id (string): Unique identifier of the destination.
 * - name (string): Display name shown in the UI (typically formatted as "City, Country").
 * Output: DestinationOption type - Used for dropdowns and selection components.
 */
export type DestinationOption = {
  id: string;
  name: string;
};
