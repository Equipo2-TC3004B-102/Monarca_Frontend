/**
 * Footer.test.tsx
 * Description: This file contains the test suite for the Footer component. 
 * It tests that the current year and the copyright and policy text render correctly.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 */

import { render, screen } from "@testing-library/react";
import Footer from "../../components/Footer";

describe("Footer", () => {
  it("muestra el año actual y el texto de copyright", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`Copyright © ${year} 02 Solutions\\.`))
    ).toBeInTheDocument();
    expect(
      screen.getByText("All Rights Reserved | Terms and Conditions | Privacy Policy")
    ).toBeInTheDocument();
  });
});
