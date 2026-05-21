/**
 * Input.tsx
 * Description: Reusable UI Input component that wraps the native HTML <input> element with consistent base
 * styling and ref forwarding.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 20/04/2026 [Jin Sik Yoon] Improved error handling for better UX.
 * 23/04/2026 [Santiago Coronado Hernández] Added onWheel and onFocus handler for number inputs to allow incrementing/decrementing values with mouse wheel, and ensured proper cleanup of event listeners on blur to prevent memory leaks.
 * 04/05/2026 [Rebeca-Davila] Changed colors for dark mode
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
  ({ className, onWheel, onFocus, onBlur, type, value, style, ...props }, ref) => {
    /**
     * baseStyles, provides default Tailwind/CSS classes for consistent input appearance across the UI.
     */
    const baseStyles =
      "bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-page-text)] text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5";
    const dateStyle: React.CSSProperties | undefined =
      type === "date" && !value ? { color: "#9ca3af", ...style } : style;
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        style={dateStyle}
        className={clsx(baseStyles, className)}
        onFocus={(e) => {
          if (type === "number") {
            const el = e.currentTarget as HTMLInputElement & {
              _wheelHandler?: (event: WheelEvent) => void;
            };

            const handleWheel = (event: WheelEvent) => {
              event.preventDefault();
              const current = parseFloat(el.value || "0");

              if (event.deltaY < 0) {
                el.value = (current + 1).toFixed(2);
              } else {
                el.value = Math.max(0, current - 1).toFixed(2);
              }

              el.dispatchEvent(new Event("input", { bubbles: true }));
            };

            el._wheelHandler = handleWheel;
            el.addEventListener("wheel", handleWheel, { passive: false });
          }

          onFocus?.(e);
        }}
        onBlur={(e) => {
          if (type === "number") {
            const el = e.currentTarget as HTMLInputElement & {
              _wheelHandler?: (event: WheelEvent) => void;
            };

            if (el._wheelHandler) {
              el.removeEventListener("wheel", el._wheelHandler);
              delete el._wheelHandler;
            }
          }

          onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
