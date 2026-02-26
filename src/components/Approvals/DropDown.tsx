/**
 * DropDown.tsx
 * Description: Custom reusable dropdown component with click-outside detection and Tailwind styling.
 * Authors: Original Monarca team
 * Last Modification made:
 * 25/02/2026 [Diego Ortega] Added Specified Format.
 */

import React, { useState, useRef, useEffect } from "react";

/**
 * Option
 * Interface representing a single dropdown item.
 */
interface Option {
  value: string;
  label: string;
}

/**
 * DropdownProps
 * Interface for component properties.
 */
interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Dropdown Component
 * A custom select input that manages its own open/close state and detects clicks outside to close.
 * * Input:
 * - id (string, optional): Unique identifier for the element.
 * - options (Option[]): Array of objects with value and label.
 * - value (string): Currently selected value.
 * - onChange (function): Callback triggered when an option is selected.
 * - placeholder (string): Text shown when no option is selected.
 * * Output:
 * - JSX.Element: A custom-styled dropdown menu.
 */
const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Effect to close the dropdown when clicking outside of the component area.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative inline-block w-48" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring"
      >
        {selectedOption ? selectedOption.label : placeholder}
        <span className="float-right">&#x25BC;</span> {/* Arrow ▼ */}
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow max-h-60 overflow-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 hover:bg-blue-600 hover:text-white ${
                opt.value === value ? "bg-blue-500 text-white" : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
