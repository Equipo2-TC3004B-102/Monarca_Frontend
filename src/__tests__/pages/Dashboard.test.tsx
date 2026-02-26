/**
 * Dashboard.test.tsx
 * Description: Test suite for the Dashboard page component. Covers page title updates and permission-based card rendering.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Dashboard } from "../../pages/Dashboard";

// Mock both context hooks
const mockSetPageTitle = vi.fn();
const mockAuthState = {
  userPermissions: [
    "create_request",
    "view_assigned_requests_readonly",
    "upload_vouchers",
    "approve_request",
    "approve_vouchers",
    "check_budgets",
    "submit_reservations",
  ],
  user: null,
  isAuthenticated: true,
};

vi.mock("../../hooks/app/appContext", () => ({
  useApp: () => ({
    setPageTitle: mockSetPageTitle,
    pageTitle: "Mock Title",
  }),
}));

vi.mock("../../hooks/auth/authContext", () => ({
  useAuth: () => ({
    authState: mockAuthState,
  }),
  Permission: {},
}));

// Mock Mosaic to avoid Link issues
vi.mock("../../components/Mosaic", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="mosaic">{title}</div>
  ),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Renders a React element wrapped in MemoryRouter for isolated routing.
   * @param component - The React element to render
   * @returns The render result
   */
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it("renders dashboard with correct title and cards", () => {
    renderWithRouter(<Dashboard title="Dashboard Test" />);

    expect(mockSetPageTitle).toHaveBeenCalledWith("Dashboard Test");
    expect(screen.getByText("Crear solicitud de viaje")).toBeInTheDocument();
  });

  it("updates page title when title prop changes", () => {
    const { rerender } = render(
      <MemoryRouter>
        <Dashboard title="Initial Title" />
      </MemoryRouter>,
    );
    expect(mockSetPageTitle).toHaveBeenCalledWith("Initial Title");

    rerender(
      <MemoryRouter>
        <Dashboard title="Updated Title" />
      </MemoryRouter>,
    );
    expect(mockSetPageTitle).toHaveBeenCalledWith("Updated Title");
  });
});
