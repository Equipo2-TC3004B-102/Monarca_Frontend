/**
 * Request.test.tsx
 * Description: Test suite for the Request page component. Verifies that RequestRow is rendered and CSS container styles are correct.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import Requests from "../../pages/Requests.tsx";
import RequestRow from "../../components/RequestRow.tsx";

// Mock RequestRow to avoid rendering its full implementation
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
   * Tests if the RequestRow component is rendered inside the Requests page.
   */
  it("renders RequestRow component", () => {
    render(<Requests />);
    expect(RequestRow).toHaveBeenCalled();
    expect(screen.getByTestId("mocked-request-row")).toBeInTheDocument();
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
});
