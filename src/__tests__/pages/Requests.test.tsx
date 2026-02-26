/**
 * Requests.test.tsx
 * Description: Test suite for the Requests page component. Covers RequestRow rendering, container CSS classes, and DOM structure.
 * Authors: Gabriel Edid Harari
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Requests from "../../pages/Requests";

/**
 * Mocks the RequestRow component for simplified testing.
 */
vi.mock("../../components/RequestRow", () => ({
  default: vi.fn(() => (
    <div data-testid="mocked-request-row">Mocked Request Row</div>
  )),
}));

describe("Requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests if the RequestRow component renders correctly inside the Requests page.
   */
  it("renders RequestRow component", () => {
    render(<Requests />);
    expect(screen.getByTestId("mocked-request-row")).toBeInTheDocument();
    expect(screen.getByText("Mocked Request Row")).toBeInTheDocument();
  });

  /**
   * Tests if the correct CSS utility classes are applied to the container element.
   */
  it("applies correct styles to the container", () => {
    const { container } = render(<Requests />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass("mt-6");
    expect(mainDiv).toHaveClass("px-4");
  });

  /**
   * Tests if the component has the correct DOM structure with a div root element.
   */
  it("has the correct structure", () => {
    const { container } = render(<Requests />);

    const rootElement = container.firstChild;
    expect(rootElement).toBeInTheDocument();
    expect(rootElement?.nodeName).toBe("DIV");

    // RequestRow should be a direct child of the container
    const requestRowElement = screen.getByTestId("mocked-request-row");
    expect(requestRowElement.parentElement).toBe(rootElement);
  });
});
