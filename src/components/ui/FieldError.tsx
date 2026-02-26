/**
 * FieldError.tsx
 * Description: Small UI helper component that conditionally renders a styled validation/error message below a form field.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FieldError, renders a validation message if provided; otherwise renders nothing.
 * Input:
 * - msg (string | undefined): Optional error message to display.
 * Output: JSX.Element | null - A <p> element with error styling or null when there is no message.
 */
export default function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null;
}
