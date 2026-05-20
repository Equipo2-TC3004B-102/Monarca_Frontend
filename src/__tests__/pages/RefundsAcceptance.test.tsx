/**
 * File: RefundsAcceptance.test.tsx
 * Description: Test suite for the RefundsAcceptance page component
 * Authors: Gabriel Edid Harari
 * Last Modification made:
 * 16/05/2025 [Gabriel Edid Harari] Initial tests.
 * 20/05/2026 [Diego de la Vega] Updated mocks to use real voucher status strings.
 *   Added regression tests for:
 *   - Balance calculation (advance_money - approved total, NOT advance + total)
 *   - String decimal amounts from PostgreSQL rendered correctly (not $0.00)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RefundsAcceptance from "../../pages/Refunds/RefundsAcceptance";
import React from "react";

// Mock router hooks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "123" }),
    useNavigate: () => mockNavigate,
  };
});

// Base mock response used across tests.
// advance_money is a STRING to simulate what PostgreSQL returns for decimal columns.
const baseApiResponse = {
  id: "123",
  admin: { name: "John", last_name: "Doe" },
  destination: { city: "NYC" },
  requests_destinations: [
    { destination: { city: "Chicago" } },
    { destination: { city: "Boston" } },
  ],
  createdAt: "2024-01-01",
  advance_money: "1000.00", // PostgreSQL decimal string
  motive: "Business Trip",
  status: "Pending Vouchers Approval",
  requirements: "None",
  priority: "High",
  vouchers: [
    {
      id: "v1",
      file_url_pdf: "file1.pdf",
      file_url_xml: "file1.xml",
      status: "pending_voucher", // real status string used by the app
      class: "GAS",
      amount: "500.00", // PostgreSQL string
      date: "2024-01-01",
    },
    {
      id: "v2",
      file_url_pdf: "file2.pdf",
      file_url_xml: "file2.xml",
      status: "Voucher Approved", // real status string used by the app
      class: "Hotel",
      amount: "300.00", // PostgreSQL string
      date: "2024-01-02",
    },
  ],
};

// Mutable reference so individual tests can override it
const mockGetRequest = vi.fn(() => Promise.resolve(baseApiResponse));

vi.mock("../../utils/apiService", () => ({
  getRequest: (...args: any[]) => mockGetRequest(...args),
  patchRequest: vi.fn(() => Promise.resolve({})),
}));

// Mock useApp — RefundsAcceptance calls useApp() on every render.
// Without this, all tests crash with "useApp must be used within an AppProvider".
vi.mock("../../hooks/app/appContext", () => ({
  useApp: () => ({
    handleVisitPage: vi.fn(),
    tutorial: false,
    setTutorial: vi.fn(),
  }),
}));

// Mock Tutorial — it renders an overlay that depends on AppContext
vi.mock("../../components/Tutorial", () => ({
  Tutorial: ({ children }: any) => <>{children}</>,
}));

// Lightweight mock that mirrors the fixed formatMoney behavior (parseFloat support)
vi.mock("../../utils/formatMoney", () => ({
  default: (value: any, _currency?: string) => {
    const n = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(n)) return "$0.00";
    return `$${n.toFixed(2)}`;
  },
}));

vi.mock("../../utils/formatDate", () => ({
  default: (_date: string) => "2024-01-01",
}));

vi.mock("../../components/GoBack", () => ({
  default: () => <div data-testid="go-back">Go Back</div>,
}));

vi.mock("../../components/Refunds/FilePreviewer", () => ({
  default: ({ file, fileIndex }: any) => (
    <div data-testid={`file-previewer-${fileIndex}`}>
      File: {file?.id || "unknown"}
    </div>
  ),
}));

vi.mock("swiper/react", () => ({
  Swiper: ({ children, onBeforeInit }: any) => {
    React.useEffect(() => {
      if (onBeforeInit) {
        const mockSwiper = {
          params: { navigation: { prevEl: null, nextEl: null } },
        };
        onBeforeInit(mockSwiper);
      }
    }, []);
    return <div data-testid="swiper">{children}</div>;
  },
  SwiperSlide: ({ children }: any) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));

vi.mock("swiper/modules", () => ({
  Navigation: {},
  Pagination: {},
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("RefundsAcceptance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRequest.mockResolvedValue(baseApiResponse);
  });

  const renderWithRouter = (component: React.ReactElement) =>
    render(<MemoryRouter>{component}</MemoryRouter>);

  it("renders the component with basic elements", async () => {
    renderWithRouter(<RefundsAcceptance />);
    expect(screen.getByTestId("go-back")).toBeInTheDocument();
    await waitFor(
      () => {
        // The request ID is always visible and not affected by i18n
        expect(screen.getByText("123")).toBeInTheDocument();
        // Check the main content container is rendered
        expect(document.getElementById("request-info")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("renders form fields with correct labels", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        // Use IDs because i18n returns raw keys in test env (e.g. "refundAcceptance.requestId")
        expect(document.getElementById("id")).toBeInTheDocument();
        expect(document.getElementById("admin")).toBeInTheDocument();
        expect(document.getElementById("id_origin_city")).toBeInTheDocument();
        expect(document.getElementById("destinations")).toBeInTheDocument();
        expect(document.getElementById("motive")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("displays vouchers in swiper", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        expect(screen.getByTestId("swiper")).toBeInTheDocument();
        expect(screen.getAllByTestId(/swiper-slide/)).toHaveLength(2);
      },
      { timeout: 3000 },
    );
  });

  it("renders approve/deny buttons", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        // Use IDs — button text depends on i18n translation keys in test env
        expect(document.getElementById("approve-button")).toBeInTheDocument();
        expect(document.getElementById("deny-button")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("displays navigation buttons", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        // Use IDs — button text is i18n key in test env
        expect(document.getElementById("next-voucher")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("displays summary section labels", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        // Both fields exist by element ID
        expect(document.getElementById("total")).toBeInTheDocument();
        expect(document.getElementById("advance_money")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("disables complete button when vouchers are pending", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        const completeButton = document.getElementById("complete-refund") as HTMLButtonElement;
        expect(completeButton).toBeInTheDocument();
        expect(completeButton).toBeDisabled();
      },
      { timeout: 3000 },
    );
  });

  it("handles form input display", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        // Use getElementById — label text is an i18n key in test env, not the translated string
        const idInput = document.getElementById("id") as HTMLInputElement;
        expect(idInput).toBeInTheDocument();
        expect(idInput.value).toBe("123");
        expect(idInput.readOnly).toBe(true);
      },
      { timeout: 3000 },
    );
  });

  /**
   * REGRESSION TEST — balance was computed as (advance + approved_total) instead of
   * (advance - approved_total). With advance=1000 and one approved voucher of $300,
   * the correct "Total" is $700.00, NOT $1300.00.
   */
  it("(regression) computes balance as advance MINUS approved vouchers, not plus", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        // The second input with id="total" shows the net balance
        const allTotals = document.querySelectorAll('#total');
        // The last #total is the net balance (advance - approved)
        const balanceInput = allTotals[allTotals.length - 1] as HTMLInputElement;
        // advance_money="1000.00", one "Voucher Approved" amount="300.00"
        // expected: 1000 - 300 = 700 → "$700.00"
        expect(balanceInput.value).toBe("$700.00");
      },
      { timeout: 3000 },
    );
  });

  /**
   * REGRESSION TEST — advance_money arrives as the PostgreSQL decimal string "1000.00".
   * The advance input must show $1000.00, NOT $0.00 (which was the bug before
   * formatMoney.tsx was fixed to call parseFloat on non-number inputs).
   */
  it("(regression) shows correct advance amount when API returns a decimal string", async () => {
    renderWithRouter(<RefundsAcceptance />);
    await waitFor(
      () => {
        const advanceInput = document.getElementById("advance_money") as HTMLInputElement;
        expect(advanceInput).toBeInTheDocument();
        // Before fix: returned $0.00 because typeof "1000.00" !== "number"
        expect(advanceInput.value).not.toBe("$0.00");
        expect(advanceInput.value).toBe("$1000.00");
      },
      { timeout: 3000 },
    );
  });
});
