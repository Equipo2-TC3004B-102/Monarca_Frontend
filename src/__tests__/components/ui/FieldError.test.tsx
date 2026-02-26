/**
 * FieldError.test.tsx
 * Description: Test suite to validate the behavior of the FieldError component.
 * It verifies that the component displays an error message when provided, 
 * renders nothing if no message exists, applies the correct styles, 
 * and ensures the message is rendered as a paragraph (<p>) element.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FieldError from "../../../components/ui/FieldError";

describe("FieldError", () => {
  it("renders error message when provided", () => {
    render(<FieldError msg="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("does not render anything when no message is provided", () => {
    const { container } = render(<FieldError />);
    expect(container).toBeEmptyDOMElement();
  });

  it("applies correct styles to error message", () => {
    render(<FieldError msg="Error message" />);
    const errorElement = screen.getByText("Error message");
    expect(errorElement).toHaveClass("mt-1");
    expect(errorElement).toHaveClass("text-sm");
    expect(errorElement).toHaveClass("text-red-600");
  });

  it("renders as a paragraph element", () => {
    render(<FieldError msg="Error message" />);
    const errorElement = screen.getByText("Error message");
    expect(errorElement.tagName).toBe("P");
  });
});
