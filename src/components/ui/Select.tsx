/**
 * Select.tsx
 * Description: Reusable Select component built with Headless UI Listbox for accessible dropdown selection with
 * loading/disabled states.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

/**
 * Option, represents a selectable item in the Select component.
 * Input: id (number | string), name (string)
 * Output: Option type - Used for options list and current value.
 */
type Option = {
  id: number | string;
  name: string;
};

/**
 * SelectProps, defines props required to render and control the Select component.
 * Input:
 * - options (Option[]): List of selectable options.
 * - value (Option | null | undefined): Current selected option.
 * - onChange ((option: Option) => void): Callback triggered when the selection changes.
 * - direction ("up" | "down"): Dropdown opening direction.
 * - isLoading (boolean): Whether the component is in loading state.
 * - isDisabled (boolean): Whether the select is disabled.
 * - placeholder (string): Placeholder shown when there is no selection.
 * - id (string | undefined): Optional DOM id for accessibility/testing.
 * Output: SelectProps type - Used for type-checking Select component props.
 */
type SelectProps = {
  options: Option[];
  value: Option | null | undefined;
  onChange: (option: Option) => void;
  direction?: "up" | "down";
  isLoading?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  id?: string;
};

/**
 * Select, renders an accessible dropdown using Headless UI Listbox.
 * Input: SelectProps - Options, selected value, change handler, and UI states (loading/disabled).
 * Output: JSX.Element - A dropdown component with selectable options and visual selection indicators.
 */
export default function Select({
  options,
  value,
  onChange,
  direction = "down",
  isLoading = false,
  isDisabled = false,
  placeholder = "Selecciona una opción",
  id,
}: SelectProps) {
  return (
    <Listbox value={value || null} onChange={onChange} disabled={isDisabled}>
      <div className="relative">
        <ListboxButton
          id={id}
          className={`relative w-full cursor-default rounded-md p-2.5 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
            isDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
        >
          <span className="block truncate">
            {isLoading ? "Cargando..." : value?.name || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              aria-hidden="true"
              className="h-5 w-5 text-gray-400"
            />
          </span>
        </ListboxButton>

        <ListboxOptions
          transition
          className={`absolute z-10 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-gray-300 ring-opacity-5 focus:outline-none sm:text-sm ${
            direction === "up" ? "bottom-full mb-1" : "mt-1"
          }`}
        >
          {isLoading ? (
            <div className="cursor-default select-none py-2 px-4 text-gray-700">
              Cargando...
            </div>
          ) : options.length === 0 ? (
            <div className="cursor-default select-none py-2 px-4 text-gray-700">
              No hay opciones disponibles.
            </div>
          ) : (
            options.map((option) => (
              <ListboxOption
                key={String(option.id)}
                value={option}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  }`
                }
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {option.name}
                    </span>

                    {selected ? (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                          active ? "text-white" : "text-indigo-600"
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ListboxOption>
            ))
          )}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
