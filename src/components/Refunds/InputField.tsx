/**
 * FileName: InputField.tsx
 * Description: This file contains the InputField component used in the Refunds section of the application.
 * It provides a customizable input field with proper validation and styling.
 * Authors: Original Moncarca team
 * Last Modification made: 
 * 25/02/2026 Nicolas Quintana Added detailed comments and documentation for 
 * clarity and maintainability.
 */
import React, { ChangeEvent, useState } from "react";

/*
 * InputFieldProps interface to define the structure of the props for the InputField component.
 */
interface InputFieldProps {
  id?: string;
  name?: string;
  type?:
    | "text"
    | "file"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time"
    | "datetime-local"
    | "month"
    | "week"
    | "color"
    | "checkbox"
    | "radio"
    | "range"
    | "hidden";
  value?: string; // Hacer value opcional para file inputs
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  accept?: string; // Para inputs de tipo file, especifica los tipos de archivos aceptados
  label?: string;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  validateField?: (value: string) => string | undefined;
  selectedFileName?: string;
}

/**
 * InputField, renders a customizable input field with client-side validation, supporting multiple input types and proper error handling.
 * Input: id, name, type, accept, value, placeholder, className, disabled, required, label, error, onChange, onBlur, onFocus, validateField, selectedFileName
 * Output: JSX element - a validated input field component with error messages
 */
const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  type = "text",
  accept, // Para inputs de tipo file, especifica los tipos de archivos aceptados
  value,
  placeholder = "",
  className = "",
  disabled = false,
  required = false,
  label,
  error,
  onChange,
  onBlur,
  onFocus,
  validateField,
  selectedFileName,
}) => {
  // Set default placeholder for date inputs
  const effectivePlaceholder =
    type === "date" && !placeholder ? "DD/MM/YYYY" : placeholder;

  // Local state to track validation errors and touched state
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [isTouched, setIsTouched] = useState(false);
  const [wasChanged, setWasChanged] = useState(false);

  /**
   * isEmptyValue, determines if an input value is empty based on its input type.
   * Input: val (string | undefined), inputType (string)
   * Output: boolean - true if value is empty, false otherwise
   */
  const isEmptyValue = (val: string | undefined, inputType: string = type): boolean => {
    // Para file inputs, verificamos si hay un archivo seleccionado
    if (inputType === "file") {
      return !selectedFileName;
    }

    // For checkboxes and radios, we don't use trim()
    if (inputType === "checkbox" || inputType === "radio") {
      // For these types, we might consider "false" or "0" as empty
      return val === "false" || val === "0" || val === "";
    }

    // For number inputs
    if (inputType === "number") {
      return val === "" || val === null || val === undefined;
    }

    // For color inputs (should always have a value)
    if (inputType === "color") {
      return false;
    }

    // For range inputs (should always have a value)
    if (inputType === "range") {
      return false;
    }

    // For normal string-based inputs, use trim()
    return typeof val === "string"
      ? val.trim() === ""
      : val === null || val === undefined;
  };

  // Combined error message (from props or local validation)
  const errorMessage =
    error || (isTouched || wasChanged ? localError : undefined);

  // Determine if the field is in an invalid state - now checks both touched and changed state
  const isInvalid =
    required && isEmptyValue(type === "file" ? undefined : value) && (isTouched || wasChanged);

  // Base styles for the input - adjusted for different input types
  const baseClass = `p-2 border rounded-md focus:outline-none focus:ring-2 ${
    type === "checkbox" || type === "radio"
      ? "w-auto hover:cursor-pointer" // Checkbox and radio shouldn't be full width
      : type === "file"
      ? "w-full hover:cursor-pointer"
      : type === "color"
      ? "w-auto h-10 hover:cursor-pointer" // Color picker needs specific height
      : type === "range"
      ? "w-full hover:cursor-ew-resize"
      : type === "date"
      ? "w-full hover:cursor-pointer"
      : "w-full hover:cursor-text"
  }`;

  // Final className combining all styles
  const borderClass =
    isInvalid || errorMessage
      ? "border-red-500 focus:ring-blue-500"
      : "border-gray-300 focus:ring-blue-500";

  // Text color
  const textClass = "text-[#0a2c6d]";

  /**
   * validateInput, validates an input field based on required status and custom validation rules.
   * Input: inputValue (string | undefined), touched (boolean)
   * Output: boolean - true if validation passes, false otherwise
   */
  const validateInput = (inputValue: string | undefined, touched: boolean = isTouched) => {
    // Check if field is required and empty
    if (required && isEmptyValue(inputValue) && touched) {
      setLocalError("Este campo es obligatorio");
      return false;
    }
    // Run custom validation if provided
    else if (validateField && inputValue) {
      const validationError = validateField(inputValue);
      setLocalError(validationError);
      return !validationError;
    }
    // Clear error if field is valid
    else {
      setLocalError(undefined);
      return true;
    }
  };

  /**
   * handleBlur, handles blur event, marks field as touched, validates input and calls original onBlur callback.
   * Input: none
   * Output: void
   */
  const handleBlur = () => {
    setIsTouched(true);
    // Pass true as touched parameter since we're setting it to true
    validateInput(type === "file" ? selectedFileName : value, true);

    // Call original onBlur if provided
    if (onBlur) onBlur();
  };

  /**
   * handleChange, handles input change event, marks field as changed, validates input and calls original onChange callback.
   * Input: e (ChangeEvent<HTMLInputElement>)
   * Output: void
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Call original onChange handler
    onChange(e);

    // Mark that the field has been changed
    setWasChanged(true);

    // Validate on change
    const valueToValidate = type === "file" 
      ? e.target.files?.[0]?.name 
      : e.target.value;
    validateInput(valueToValidate);
  };

  /**
   * handleFocus, handles focus event, marks field as touched and calls original onFocus callback.
   * Input: none
   * Output: void
   */
  const handleFocus = () => {
    setIsTouched(true);
    if (onFocus) onFocus();
  };

  /**
   * renderInput, renders the appropriate input element based on input type (checkbox, radio, file, or standard inputs).
   * Input: none
   * Output: JSX element - input element with appropriate wrapper and label
   */
  const renderInput = () => {
    // Special case for checkbox and radio inputs
    if (type === "checkbox" || type === "radio") {
      return (
        <div className="flex items-center">
          <input
            id={id || name}
            name={name}
            type={type}
            value={value}
            checked={value === "true" || value === "1"}
            className={`${baseClass} ${borderClass} ${textClass} ${className}`}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-invalid={!!errorMessage}
            aria-required={required}
          />
          {label && (
            <label
              htmlFor={id || name}
              className="ml-2 text-sm font-medium text-[#0a2c6d]"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
      );
    }

    // Special case for file inputs
    if (type === "file") {
      return (
        <>
          {label && (
            <label
              htmlFor={id || name}
              className="mb-1 text-sm font-medium text-[#0a2c6d]"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <div className="relative">
            <input
              accept={accept || "image/*"}
              id={id || name}
              name={name}
              type={type}
              className={`${baseClass} ${borderClass} ${textClass} ${className}`}
              disabled={disabled}
              required={required}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              aria-invalid={!!errorMessage}
              aria-required={required}
            />
            {selectedFileName && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800">
                  📁 {selectedFileName}
                </span>
              </div>
            )}
          </div>
        </>
      );
    }

    // Default case for all other input types
    return (
      <>
        {label && (
          <label
            htmlFor={id || name}
            className="mb-1 text-sm font-medium text-[#0a2c6d]"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={id || name}
            name={name}
            type={type}
            value={value || ""}
            placeholder={effectivePlaceholder}
            className={`${baseClass} ${borderClass} ${textClass} ${className}`}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-invalid={!!errorMessage}
            aria-required={required}
            role={type === "date" ? "spinbutton" : undefined}
          />
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col mb-4">
      {renderInput()}
      {errorMessage && (
        <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default InputField;