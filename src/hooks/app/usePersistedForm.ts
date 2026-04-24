/**
 * FileName: usePersistedForm.ts
 * Description: Custom React hook to persist form state in localStorage using react-hook-form.
 * Authors: DebugStudio Team
 * Last Modification made:
 * 23/04/2026 [Santiago-Coronado] Created usePersistedForm hook to automatically save and restore form state in localStorage, improving UX by preventing data loss on accidental refreshes or navigation.
 */
import { useEffect, useRef } from "react";
import { Control, FieldValues, UseFormReset, useWatch } from "react-hook-form";

interface UsePersistedFormParams<
  T extends FieldValues,
  TTransformedValues extends FieldValues = T,
> {
  storageKey: string;
  control: Control<T, unknown, TTransformedValues>;
  reset: UseFormReset<T>;
  enabled?: boolean;
}

/**
 * FunctionName: usePersistedForm, a custom React hook that integrates with react-hook-form to persist form state in localStorage.
 * Input: 
 * - storageKey (string): The key under which the form state will be stored in localStorage.
 * - control (Control): The react-hook-form control instance.
 * - reset (UseFormReset): The reset function from react-hook-form.
 * - enabled (boolean): Whether the persistence is enabled.
 * Output: An object containing the clearPersistedForm function.
 */
export function usePersistedForm<
  T extends FieldValues,
  TTransformedValues extends FieldValues = T,
>({
  storageKey,
  control,
  reset,
  enabled = true,
}: UsePersistedFormParams<T, TTransformedValues>) {
  const values = useWatch({ control });
  const isHydratedRef = useRef(false);
  const hasSkippedInitialPersistRef = useRef(false);
  const isPersistenceEnabledRef = useRef(true);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      isHydratedRef.current = true;
      return;
    }

    try {
      const storedValue = window.localStorage.getItem(storageKey);
      if (storedValue) {
        const parsed = JSON.parse(storedValue) as T;
        reset(parsed);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      isHydratedRef.current = true;
    }
  }, [enabled, reset, storageKey]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !isHydratedRef.current) {
      return;
    }

    if (!isPersistenceEnabledRef.current) {
      return;
    }

    if (!hasSkippedInitialPersistRef.current) {
      hasSkippedInitialPersistRef.current = true;
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      // Ignore quota and serialization errors to avoid blocking form usage.
    }
  }, [enabled, storageKey, values]);

  const clearPersistedForm = () => {
    if (typeof window === "undefined") {
      return;
    }

    isPersistenceEnabledRef.current = false;
    window.localStorage.removeItem(storageKey);
  };

  return { clearPersistedForm };
}
