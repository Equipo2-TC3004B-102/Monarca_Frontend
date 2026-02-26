/**
 * Switch.tsx
 * Description: Reusable toggle switch component built with Headless UI Switch for accessible boolean input,
 * with disabled and custom label support.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */

import { Switch as HSwitch } from "@headlessui/react";
import clsx from "clsx";

/**
 * SwitchProps, defines the props required to control the Switch component.
 * Input:
 * - checked (boolean): Current switch state.
 * - onChange ((value: boolean) => void): Callback triggered when the switch value changes.
 * - disabled (boolean | undefined): Disables interaction when true.
 * - className (string | undefined): Optional extra classes to extend/override base styles.
 * - srLabel (string | undefined): Screen-reader label for accessibility.
 * - id (string | undefined): Optional DOM id for accessibility/testing.
 * Output: SwitchProps interface - Used for type-checking Switch component props.
 */
export interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  srLabel?: string;
  id?: string;
}

/**
 * Switch, renders a styled toggle using Headless UI with proper accessibility defaults.
 * Input: SwitchProps - Controlled checked value and onChange handler plus optional states.
 * Output: JSX.Element - A toggle switch component.
 */
export default function Switch({
  checked,
  onChange,
  disabled = false,
  className,
  srLabel = "toggle",
  id,
}: SwitchProps) {
  return (
    <HSwitch
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={clsx(
        "relative inline-flex h-7 w-14 items-center rounded-full transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        checked ? "bg-indigo-600" : "bg-gray-300",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span className="sr-only">{srLabel}</span>
      <span
        aria-hidden="true"
        className={clsx(
          "inline-block size-5 transform rounded-full bg-white shadow transition",
          checked ? "translate-x-7" : "translate-x-1"
        )}
      />
    </HSwitch>
  );
}