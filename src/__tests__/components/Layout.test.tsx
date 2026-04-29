/**
 * Layout.test.tsx
 * Description: This file contains the test suite for the Layout component. It tests the loading state, 
 * redirection to login, and proper rendering of Header, Sidebar, Footer and children when authenticated.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 */

import { render, screen } from "@testing-library/react";
import Layout from "../../components/Layout";
import { useAuth } from "../../hooks/auth/authContext";
import { vi, Mock } from "vitest";

// useAuth Mock
vi.mock("../../hooks/auth/authContext", () => ({
  useAuth: vi.fn(),
}));

// Intern components Mocks
vi.mock("react-toastify", () => ({ ToastContainer: () => <div data-testid="toast" /> }));
vi.mock("../../components/Header",  () => ({ __esModule: true, default: () => <div>Header</div> }));
vi.mock("../../components/Sidebar", () => ({ __esModule: true, default: () => <div>Sidebar</div> }));
vi.mock("../../components/Footer",  () => ({ __esModule: true, default: () => <div>Footer</div> }));
vi.mock("react-router-dom", () => ({
  Navigate: ({ to }: { to: string }) => <div>Redirected to {to}</div>
}));

describe("Layout", () => {
  const mockedUseAuth = useAuth as unknown as Mock;

  it("muestra Loading... cuando loadingProfile=true", () => {
    mockedUseAuth.mockReturnValue({ loadingProfile: true, authState: { isAuthenticated: false } });
    render(<Layout><span>child</span></Layout>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirige a /login si no está autenticado", () => {
    mockedUseAuth.mockReturnValue({ loadingProfile: false, authState: { isAuthenticated: false } });
    render(<Layout><span>child</span></Layout>);
    // checks if there's a redirection message
    expect(screen.getByText(/^Redirected to/)).toBeInTheDocument();
    // and that the "child" isn't shown
    expect(screen.queryByText("child")).toBeNull();
  });

  it("renderiza children, Header, Sidebar y Footer cuando está autenticado", () => {
    mockedUseAuth.mockReturnValue({ loadingProfile: false, authState: { isAuthenticated: true } });
    render(<Layout><span>child</span></Layout>);

    // Components and content
    ["Header", "Sidebar", "child", "Footer"].forEach(text =>
      expect(screen.getByText(text)).toBeInTheDocument()
    );

    // ToastContainer must be shown at least once
    expect(screen.getAllByTestId("toast").length).toBeGreaterThanOrEqual(1);
  });
});
