/**
 * SearchableSelect.tsx
 * Description: Reusable Select component built with Headless UI Combobox for an accessible, searchable dropdown.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 04/05/2026 [Rebeca-Davila] Changed colors for dark mode
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
import { useTranslation } from "react-i18next";

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
  placeholder,
  id,
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const effectivePlaceholder = placeholder ?? t('common.searchOption');
  const [query, setQuery] = useState("");

  const normalize = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "");

  const normalizedQuery = useMemo(
    () => normalize(query),
    [query],
  );

  const filteredOptions = useMemo(() => {
    if (normalizedQuery === "") {
      return options.slice(0, MAX_VISIBLE_OPTIONS);
    }

    const result: Option[] = [];
    for (const option of options) {
      if (normalize(option.name).includes(normalizedQuery)) {
        result.push(option);
      }
      if (result.length >= MAX_VISIBLE_OPTIONS) {
        break;
      }
    }

    return result;
  }, [options, normalizedQuery]);

  const handleChange = (option: Option | null) => {
    setQuery("");
    onChange(option);
  };

  return (
    <Combobox value={value || null} onChange={handleChange} disabled={isDisabled}>
      {({ open }) => (
        <div className="relative">
          <div className="relative w-full cursor-default rounded-md bg-[var(--color-card-bg)] border border-[var(--color-border)] text-left text-[var(--color-page-text)] focus-within:ring-2 focus-within:ring-indigo-600 sm:text-sm sm:leading-6">
            <ComboboxInput
              id={id}
              className={`w-full border-none py-2.5 pl-3 pr-10 text-sm leading-5 text-[var(--color-page-text)] focus:ring-0 rounded-md ${
                isDisabled ? "bg-gray-100 dark:bg-neutral-700 cursor-not-allowed opacity-60" : "bg-[var(--color-card-bg)]"
              }`}
              displayValue={(option: Option | null) =>
                isLoading ? t('common.loading') : option?.name ?? ""
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder={effectivePlaceholder}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>

          {open && (
            <ComboboxOptions className="bg-[var(--color-card-bg)] border border-[var(--color-border)] absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {isLoading ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  {t('common.loading')}
                </div>
              ) : filteredOptions.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  {t('common.noResults', { query })}
                </div>
              ) : (
                <>
                  {filteredOptions.map((option) => (
                    <ComboboxOption
                      key={String(option.id)}
                      value={option}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-indigo-600 text-white" : "text-[var(--color-page-text)]"
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
                    <div className="relative cursor-default select-none py-2 px-4 text-xs text-gray-500 dark:text-gray-400">
                      {t('common.showingFirst', { count: MAX_VISIBLE_OPTIONS })}
                    </div>
                  )}
                  {query !== "" && filteredOptions.length >= MAX_VISIBLE_OPTIONS && (
                    <div className="relative cursor-default select-none py-2 px-4 text-xs text-gray-500 dark:text-gray-400">
                      {t('common.moreResults')}
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
