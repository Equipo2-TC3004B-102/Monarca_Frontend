/**
 * Input.test.tsx
 * Description: Test suite to verify the functionality of the Input component. 
 * It ensures that the input renders correctly, applies custom and default styles, 
 * handles value changes, forwards additional props, and properly supports ref forwarding 
 * to the underlying HTML input element.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Input } from "../../../components/ui/Input";

describe("Input", () => {
  it("renders with default props", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });

  it("handles value changes", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("applies default styles", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("bg-gray-50");
    expect(input).toHaveClass("border");
    expect(input).toHaveClass("border-gray-300");
    expect(input).toHaveClass("text-gray-900");
    expect(input).toHaveClass("text-sm");
    expect(input).toHaveClass("rounded-lg");
  });

  it("forwards additional props to input element", () => {
    render(
      <Input data-testid="test-input" disabled placeholder="Enter text" />
    );
    const input = screen.getByTestId("test-input");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "Enter text");
  });

  it("works with ref forwarding", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
