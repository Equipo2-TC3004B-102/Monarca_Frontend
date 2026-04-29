/**
 * Button.tsx
 * Description: Reusable UI Button component that wraps the native HTML <button> element,
 * providing consistent base styling and allowing optional style extension via className.
 * Authors: Original Monarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */
import React from "react";
import clsx from "clsx";

/**
 * ButtonProps, defines the props for the Button component by extending the default HTML button attributes.
 * Input: React.ButtonHTMLAttributes<HTMLButtonElement> - All standard button props (onClick, disabled, type, etc.)
 * plus an optional className override/extension.
 * Output: ButtonProps type - Used to type-check props passed to the Button component.
 */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

/**
 * Button, renders a styled button element with a shared base style and optional custom className.
 * Input:
 * - children (React.ReactNode): Content rendered inside the button (text, icons, etc.).
 * - className (string | undefined): Optional additional Tailwind/CSS classes to extend or override base styles.
 * - props (React.ButtonHTMLAttributes<HTMLButtonElement>): Remaining native button props (type, onClick, disabled, aria-*, etc.).
 * Output: JSX.Element - A <button> element with merged classes and forwarded props.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  ...props
}) => {
  /**
   * baseStyles, contains the default Tailwind/CSS classes used across the application to keep buttons consistent.
   * Includes padding, font size/weight, background color from CSS variables, border radius, focus ring, hover effect,
   * and pointer cursor.
   */
  const baseStyles =
    "px-5 py-2.5 text-sm font-medium text-white bg-[var(--blue)] rounded-lg focus:ring-4 focus:ring-primary-200 hover:[var(--dark-blue)] cursor-pointer block";
  return (
    /**
     * Merges baseStyles with the optional className using clsx to avoid manual string concatenation.
     * Spreads remaining props to support native button behavior (disabled, type, onClick, etc.).
     */
    <button className={clsx(baseStyles, className)} {...props}>
      {children}
    </button>
  );
};