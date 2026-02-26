/**
 * TextArea.tsx
 * Description: Reusable UI TextArea component that wraps the native HTML <textarea> element with consistent base styling and ref forwarding.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */

import React from "react";
import clsx from "clsx";

/**
 * TextAreaProps, defines props for the TextArea component by extending default HTML textarea attributes.
 * Input: React.TextareaHTMLAttributes<HTMLTextAreaElement> - All standard textarea props plus optional className for style extension.
 * Output: TextAreaProps type - Used for type-checking TextArea component props.
 */
export type TextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    className?: string;
  };

/**
 * TextArea, renders a styled textarea element and forwards the ref to the underlying <textarea>.
 * Input:
 * - className (string | undefined): Optional extra classes to extend/override base styles.
 * - props (React.TextareaHTMLAttributes<HTMLTextAreaElement>): Remaining native textarea props (rows, value, onChange, placeholder, etc.).
 * - ref (React.Ref<HTMLTextAreaElement>): Forwarded ref for focusing, measuring, etc.
 * Output: JSX.Element - A <textarea> element with merged classes and forwarded props.
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    /**
     * baseStyles, provides default Tailwind/CSS classes for consistent textarea appearance across the UI.
     */
    const baseStyles =
      "block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-600 focus:border-primary-600";
    return (
      <textarea ref={ref} className={clsx(baseStyles, className)} {...props} />
    );
  }
);
