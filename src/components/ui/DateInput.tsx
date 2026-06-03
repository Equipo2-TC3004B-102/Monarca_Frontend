/**
 * FileName: DateInput.tsx
 * Description: A reusable DateInput component that wraps the native HTML <input type="date"> element, providing consistent styling and controlled behavior.
 * Authors: Debug Studio
 * Last Modification made:
 * 03/06/2026 [Nicolas Quintana] Added file description for mantainability.
 */

import { useEffect, useRef } from "react";
import clsx from "clsx";

interface DateInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DateInput({ id, value, onChange, className }: DateInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  return (
    <input
      ref={ref}
      id={id}
      type="date"
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-page-text)] text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5",
        className
      )}
    />
  );
}
