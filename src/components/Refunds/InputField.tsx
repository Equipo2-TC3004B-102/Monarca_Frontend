/**
 * FileName: InputField.tsx
 * Description: This file contains the InputField component used in the Refunds section of the application.
 * It provides a customizable input field with proper validation and styling.
 * Authors: Original Moncarca team
 * Last Modification made: 
 * 04/05/2026 [Rebeca-Davila] Changed colors for dark mode
 */
import React, { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { isFileSizeValid, getFileSizeErrorMessage } from "../../utils/fileValidation";

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
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onWheel?: React.WheelEventHandler<HTMLInputElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLInputElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
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
  accept,
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
  onWheel,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  inputMode,
}) => {
  const { t } = useTranslation();
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
  const baseClass = `p-2 bg-[var(--color-card-bg)] border rounded-md focus:outline-none focus:ring-2 ${
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
      : "border-[var(--color-border)] focus:ring-blue-500";

  // Text color
  const textClass = "text-[var(--color-page-text)]";

  /**
   * validateInput, validates an input field based on required status and custom validation rules.
   * Input: inputValue (string | undefined), touched (boolean)
   * Output: boolean - true if validation passes, false otherwise
   */
  const validateInput = (inputValue: string | undefined, touched: boolean = isTouched) => {
    // Check if field is required and empty
    if (required && isEmptyValue(inputValue) && touched) {
      setLocalError(t('common.fieldRequired'));
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
    // Validate file size for file inputs
    if (type === "file" && e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!isFileSizeValid(file)) {
        setLocalError(getFileSizeErrorMessage(file.name, file.size));
        e.target.value = "";
        return;
      }
    }

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
            onWheel={onWheel}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={onKeyDown}
            inputMode={inputMode}
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
            <label
              htmlFor={id || name}
              className={`inline-flex items-center gap-3 p-2 border rounded-md cursor-pointer hover:cursor-pointer ${borderClass} bg-[var(--color-card-bg)]`}
            >
              <span className="px-4 py-2 bg-[#0a2c6d] hover:bg-[#0d3d94] text-white rounded text-base whitespace-nowrap shrink-0">
                {t('common.chooseFile')}
              </span>
              <span className="text-sm text-gray-500 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {selectedFileName || t('common.noFileChosen')}
              </span>
            </label>
            <input
              accept={accept || "image/*"}
              id={id || name}
              name={name}
              type={type}
              className="hidden"
              disabled={disabled}
              required={required}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              aria-invalid={!!errorMessage}
              aria-required={required}
            />
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
            className="mb-1 text-sm font-medium text-[var(--color-page-text)]"
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
            onWheel={onWheel}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={onKeyDown}
            inputMode={inputMode}
            aria-invalid={!!errorMessage}
            aria-required={required}
            role={type === "date" ? "spinbutton" : undefined}
          />
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col">
      {renderInput()}
      {errorMessage && (
        <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default InputField;