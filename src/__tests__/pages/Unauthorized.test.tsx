/**
 * Unauthorized.test.tsx
 * Description: Test suite for the Unauthorized component. Tests rendering of the component and its elements, including the title, permission messages, and navigation links.
 * Authors: Leon Blanga
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Unauthorized } from "../../pages/Unauthorized";
import { beforeEach, describe, expect, it } from "vitest";

describe("Unauthorized component", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>,
    );
  });

  /**
   * Tests if the main heading renders correctly.
   */
  it("renders the main heading", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Acceso no autorizado");
  });

  /**
   * Tests if the permission denied message is displayed.
   */
  it("renders the permission denied message", () => {
    expect(
      screen.getByText("No tienes permiso para acceder a esta página."),
    ).toBeInTheDocument();
  });

  /**
   * Tests if the contact administrator message is displayed.
   */
  it("renders the contact administrator message", () => {
    expect(
      screen.getByText(
        "Contacta a un administrador si crees que esto es un error.",
      ),
    ).toBeInTheDocument();
  });

  /**
   * Tests if the dashboard link renders with the correct route.
   */
  it("has a link to the dashboard with the correct route", () => {
    const dashboardLink = screen.getByRole("link", { name: /Ir al Panel/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  /**
   * Tests if the login link renders with the correct route.
   */
  it("has a link to the login page with the correct route", () => {
    const loginLink = screen.getByRole("link", {
      name: /Ir a la Página de Iniciar Sesión/i,
    });
    expect(loginLink).toHaveAttribute("href", "/");
  });
});
