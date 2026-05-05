/*
 * FileName: AdminNotifications.test.tsx
 * Description: Test suite for AdminNotifications page. Covers loading and rendering of notification settings, toggling preferences, saving updates, and error handling when fetching settings fails.
 * Authors: Original Monarca team
 * Last Modification made:
 * 05/05/2026 [Santiago Coronado Hernández] Created test file and implemented tests for AdminNotifications page covering load, update, and error scenarios.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminNotifications from "../AdminNotifications";
import { getCompanyNotificationSettings, updateCompanyNotificationSettings } from "../../../api/companyNotificationSettings";

vi.mock("../../../api/companyNotificationSettings", () => ({
  getCompanyNotificationSettings: vi.fn(),
  updateCompanyNotificationSettings: vi.fn(),
}));

vi.mock("../../../hooks/auth/authContext", () => ({
  useAuth: () => ({
    authState: {
      companyId: "company-123",
    },
  }),
}));

vi.mock("../../../components/GoBack", () => ({
  default: () => <div data-testid="go-back" />,
}));

vi.mock("../../../components/ui/Switch", () => ({
  default: ({ checked, onChange, srLabel }: any) => (
    <button type="button" aria-label={srLabel} onClick={() => onChange(!checked)}>
      {checked ? "on" : "off"}
    </button>
  ),
}));

const baseSettings = {
  id: "setting-1",
  id_company: "company-123",
  email_enabled: true,
  in_app_enabled: false,
  email_requests_created: true,
  email_requests_status: true,
  email_revisions: false,
  email_reservations: true,
  email_admin_alerts: false,
};

const renderPage = () => render(
  <BrowserRouter>
    <AdminNotifications />
  </BrowserRouter>,
);

describe("AdminNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and renders settings", async () => {
    vi.mocked(getCompanyNotificationSettings).mockResolvedValue(baseSettings);

    renderPage();

    expect(await screen.findByText("Notificaciones")).toBeInTheDocument();
    expect(screen.getByText("Solicitud creada")).toBeInTheDocument();
    expect(screen.getByText("Empresa activa: company-123")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Habilitar correo" })).toHaveTextContent("on");
    expect(screen.getByRole("button", { name: "Habilitar notificaciones internas" })).toHaveTextContent("off");
  });

  it("saves updated settings", async () => {
    vi.mocked(getCompanyNotificationSettings).mockResolvedValue(baseSettings);
    vi.mocked(updateCompanyNotificationSettings).mockResolvedValue({
      ...baseSettings,
      in_app_enabled: true,
      email_admin_alerts: true,
    });

    renderPage();

    await screen.findByText("Notificaciones");

    fireEvent.click(screen.getByRole("button", { name: "Habilitar notificaciones internas" }));
    fireEvent.click(screen.getByRole("button", { name: "Alertas administrativas" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(updateCompanyNotificationSettings).toHaveBeenCalledWith("company-123", {
        email_enabled: true,
        in_app_enabled: true,
        email_requests_created: true,
        email_requests_status: true,
        email_revisions: false,
        email_reservations: true,
        email_admin_alerts: true,
      });
    });

    expect(await screen.findByText("Configuración de notificaciones guardada.")).toBeInTheDocument();
  });

  it("shows an error if loading fails", async () => {
    vi.mocked(getCompanyNotificationSettings).mockRejectedValue(new Error("network"));

    renderPage();

    expect(await screen.findByText("Error al cargar las notificaciones.")).toBeInTheDocument();
  });
});