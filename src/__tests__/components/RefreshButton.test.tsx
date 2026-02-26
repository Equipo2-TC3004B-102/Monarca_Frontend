/**
 * RefreshButton.test.tsx
 * Description: This file contains the test suite for the RefreshButton component. 
 * It tests that the refresh button renders and includes the refresh icon.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 */

import { render, screen } from "@testing-library/react";
import RefreshButton from "../../components/RefreshButton";

describe("RefreshButton", () => {
  it("renderiza el botón", () => {
    render(<RefreshButton />);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("contiene el icono de refrescar (svg)", () => {
    const { container } = render(<RefreshButton />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
