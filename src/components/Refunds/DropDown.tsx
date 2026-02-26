/**
 * FileName: DropDown.tsx
 * Description: This file contains the Dropdown component used in the Refunds section of the application.
 * It provides a customizable dropdown with properties for id, value, options, className, disabled state, and change handler.
 * Authors: Original Moncarca team
 * Last Modification made: 
 * 25/02/2026 Nicolas Quintana Added detailed comments and documentation for 
 * clarity and maintainability.
 */
import React, { ChangeEvent } from "react";

/**
  * Option interface to define the structure of dropdown options
  */
interface Option {
  value: string;
  label: string;
}

/**
  * DropdownProps interface to define the structure of the props for the Dropdown component.
  */
interface DropdownProps {
  id?: string;
  name?: string;
  value: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * Dropdown, renders a customizable select dropdown component with optional label, placeholder, error message, and event handlers.
 * Input: id (optional), name (optional), value (string), options (Option[]), placeholder (string), className (string), wrapperClassName (string), disabled (boolean), required (boolean), label (string), error (string), onChange, onBlur, onFocus
 * Output: JSX element - a dropdown select component
 */

const Dropdown: React.FC<DropdownProps> = ({
  id,
  name,
  value,
  options,
  placeholder = "Select an option",
  className = "p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 text-[#0a2c6d] focus:ring-blue-500 bg-white hover:cursor-pointer",
  wrapperClassName = "relative flex flex-col mb-4",
  disabled = false,
  required = false,
  label,
  error,
  onChange,
  onBlur,
  onFocus,
}) => {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={id || name} className="mb-1 text-sm font-medium text-[#0a2c6d]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select

        
          id={id || name}
          name={name}
          value={value}
          className={className}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Dropdown;