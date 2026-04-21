/**
 * SearchableSelect.tsx
 * Description: Reusable Select component built with Headless UI Combobox for an accessible, searchable dropdown.
 * Last Modification made:
 * 20/04/2026 [Diego de la Vega] Optimized option rendering for large datasets by
 *                             mounting option items only while the dropdown is open.
 */
import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

type Option = {
  id: number | string;
  name: string;
};

const MAX_VISIBLE_OPTIONS = 200;

type SearchableSelectProps = {
  options: Option[];
  value: Option | null | undefined;
  onChange: (option: Option | null) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  id?: string;
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  isLoading = false,
  isDisabled = false,
  placeholder = "Busca o selecciona una opción",
  id,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = useMemo(
    () => query.toLowerCase().replace(/\s+/g, ""),
    [query],
  );

  const filteredOptions = useMemo(() => {
    if (normalizedQuery === "") {
      return options.slice(0, MAX_VISIBLE_OPTIONS);
    }

    const result: Option[] = [];
    for (const option of options) {
      if (option.name.toLowerCase().replace(/\s+/g, "").includes(normalizedQuery)) {
        result.push(option);
      }
      if (result.length >= MAX_VISIBLE_OPTIONS) {
        break;
      }
    }

    return result;
  }, [options, normalizedQuery]);

  const handleChange = (option: Option | null) => {
    onChange(option);
  };

  return (
    <Combobox value={value || null} onChange={handleChange} disabled={isDisabled}>
      {({ open }) => (
        <div className="relative">
          <div className="relative w-full cursor-default rounded-md bg-white text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600 sm:text-sm sm:leading-6">
            <ComboboxInput
              id={id}
              className={`w-full border-none py-2.5 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 rounded-md ${
                isDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
              displayValue={(option: Option | null) =>
                isLoading ? "Cargando..." : option?.name ?? ""
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>

          {open && (
            <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {isLoading ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Cargando...
                </div>
              ) : filteredOptions.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No se encontraron resultados para "{query}".
                </div>
              ) : (
                <>
                  {filteredOptions.map((option) => (
                    <ComboboxOption
                      key={String(option.id)}
                      value={option}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-indigo-600 text-white" : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {option.name}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-indigo-600"
                              }`}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ComboboxOption>
                  ))}
                  {query === "" && options.length > MAX_VISIBLE_OPTIONS && (
                    <div className="relative cursor-default select-none py-2 px-4 text-xs text-gray-500">
                      Mostrando los primeros {MAX_VISIBLE_OPTIONS} resultados. Escribe para filtrar.
                    </div>
                  )}
                  {query !== "" && filteredOptions.length >= MAX_VISIBLE_OPTIONS && (
                    <div className="relative cursor-default select-none py-2 px-4 text-xs text-gray-500">
                      Mostrando los primeros {MAX_VISIBLE_OPTIONS} resultados. Refina tu búsqueda.
                    </div>
                  )}
                </>
              )}
            </ComboboxOptions>
          )}
        </div>
      )}
    </Combobox>
  );
}
