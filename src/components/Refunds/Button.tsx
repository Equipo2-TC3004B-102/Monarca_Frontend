/**
 * FileName: Button.tsx
 * Description: This file contains the Button component used in the Refunds section of the application.
 * It provides a customizable button with properties for id, label, className, disabled state, and click handler.
 * Authors: Original Moncarca team
 * Last Modification made: 
 * 25/02/2026 Nicolas Quintana Added detailed comments and documentation for 
 * clarity and maintainability.
 */
import React from "react";

/**
 * ButtonProps interface to define the structure of the props for the Button component.
 */

interface ButtonProps {
  id?: string;
  label: string;
  className?: string;
  disabled?: boolean;
  onClickFunction?: () => void;
}

/**
 * Button
 * Purpose: Renders a reusable button component with a label and click handler.
 * Input:
 *   - label (string): The text displayed inside the button.
 *   - onClick (() => void): Function executed when the button is clicked.
 * Output:
 *   - JSX.Element: A rendered <button> element.
 */

const Button: React.FC<ButtonProps> = ({
  id,
  label,
  className = "bg-white hover:bg-gray-300 hover:cursor-pointer p-2 text-[#0a2c6d] font-bold rounded-md shadow-md",
  disabled = false,
  onClickFunction,
}) => {
  return (
    <button className={className} disabled={disabled} onClick={onClickFunction} id={id}>
      {label}
    </button>
  );
};

export default Button;
