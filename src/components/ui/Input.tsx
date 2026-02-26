/**
 * Input.tsx
 * Description: Reusable UI Input component that wraps the native HTML <input> element with consistent base
 * styling and ref forwarding.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */
import React from "react";
import clsx from "clsx";

/**
 * InputProps, defines props for the Input component by extending the default HTML input attributes.
 * Input: React.InputHTMLAttributes<HTMLInputElement> - All standard input props plus optional className for style extension.
 * Output: InputProps type - Used for type-checking Input component props.
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

/**
 * Input, renders a styled input element and forwards the ref to the underlying <input>.
 * Input:
 * - className (string | undefined): Optional extra classes to extend/override base styles.
 * - props (React.InputHTMLAttributes<HTMLInputElement>): Remaining native input props (type, value, onChange, placeholder, etc.).
 * - ref (React.Ref<HTMLInputElement>): Forwarded ref for focusing, measuring, etc.
 * Output: JSX.Element - An <input> element with merged classes and forwarded props.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    /**
     * baseStyles, provides default Tailwind/CSS classes for consistent input appearance across the UI.
     */
    const baseStyles =
      "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5";
    return (
      <input ref={ref} className={clsx(baseStyles, className)} {...props} />
    );
  }
);
Input.displayName = "Input";
