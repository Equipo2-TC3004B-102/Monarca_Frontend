/**
 * Header.test.tsx
 * Description: This file contains the test suite for the Header component. 
 * It tests that the page title and user initials render, and that clicking the avatar 
 * toggles the dropdown with user info and calls logout.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "../../components/Header";
import { useAuth } from "../../hooks/auth/authContext";
import { useApp } from "../../hooks/app/appContext";
import { vi, Mock } from "vitest";

// Mocks
vi.mock("../../hooks/auth/authContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("../../hooks/app/appContext", () => ({
  useApp: vi.fn(),
}));

describe("Header", () => {
  const mockedUseAuth = useAuth as unknown as Mock;
  const mockedUseApp  = useApp  as unknown as Mock;
  const fakeAuth = {
    authState: {
      userName: "Leon",
      userLastName: "Blanga",
      userEmail: "leon@example.com",
      userRole: "Admin"
    },
    handleLogout: vi.fn()
  };

  beforeEach(() => {
    mockedUseAuth.mockReturnValue(fakeAuth);
    mockedUseApp.mockReturnValue({ pageTitle: "Dashboard" });
  });

  it("muestra el título de la página y las iniciales del usuario", () => {
    render(<Header />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    // L and B
    expect(screen.getByRole("button", { name: "LB" })).toBeInTheDocument();
  });

  it("al hacer clic muestra el menú con datos y botón de logout", async () => {
    render(<Header />);
    const btn = screen.getByRole("button", { name: "LB" });
    await userEvent.click(btn);

    // full name, email and rol
    expect(screen.getByText("Leon Blanga")).toBeInTheDocument();
    expect(screen.getByText("leon@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();

    const logout = screen.getByRole("button", { name: "Cerrar Sesión" });
    expect(logout).toBeInTheDocument();

    await userEvent.click(logout);
    expect(fakeAuth.handleLogout).toHaveBeenCalled();
  });
});
