/**
 * TravelRequestForm.test.tsx
 * Description: Comprehensive test suite for the TravelRequestForm component, validating form rendering,
 * field validation, dynamic destination management, automatic stay-days calculation,
 * and successful/failed submission flows. External hooks (navigation, destinations,
 * create/update mutations) are mocked to isolate component behavior and verify payload structure.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/05/2026 [Diego de la Vega] Fixed date format to be compatible with HTML input type=date.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TravelRequestForm from "../../../components/travel-requests/TravelRequestForm";
import { useNavigate } from "react-router-dom";
import { useDestinations } from "../../../hooks/destinations/useDestinations";
import { useCreateTravelRequest } from "../../../hooks/requests/useCreateRequest";
import { useUpdateTravelRequest } from "../../../hooks/requests/useUpdateRequest";

// Test setup / mocks

// Polyfill ResizeObserver for jsdom
class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}
(global as any).ResizeObserver = ResizeObserverMock;

// Mock external hooks
vi.mock("react-router-dom", () => ({ useNavigate: vi.fn() }));
vi.mock("../../../hooks/destinations/useDestinations", () => ({
  useDestinations: vi.fn(),
}));
vi.mock("../../../hooks/requests/useCreateRequest", () => ({
  useCreateTravelRequest: vi.fn(),
}));
vi.mock("../../../hooks/requests/useUpdateRequest", () => ({
  useUpdateTravelRequest: vi.fn(),
}));

// Mock Headless UI Select and SearchableSelect to render standard DOM elements inline
vi.mock("../../../components/ui/SearchableSelect", () => {
  return {
    default: ({ options, value, onChange, placeholder, id }: any) => {
      return (
        <div data-testid={`wrapper-${id}`}>
          <input
            id={id}
            aria-label={placeholder}
            placeholder={placeholder}
            value={value?.name || ""}
            onChange={() => { }}
            readOnly
          />
          <div role="listbox">
            {options.map((opt: any) => (
              <div
                key={opt.id}
                role="option"
                aria-selected={value?.id === opt.id}
                onClick={() => onChange(opt)}
              >
                {opt.name}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };
});

vi.mock("../../../components/ui/Select", () => {
  return {
    default: ({ options, value, onChange, placeholder, id }: any) => {
      return (
        <div data-testid={`wrapper-${id}`}>
          <button
            id={id}
            aria-label={placeholder}
            type="button"
          >
            {value?.name || placeholder}
          </button>
          <div role="listbox">
            {options.map((opt: any) => (
              <div
                key={opt.id}
                role="option"
                aria-selected={value?.id === opt.id}
                onClick={() => onChange(opt)}
              >
                {opt.name}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };
});


// Shared test data
const mockNavigate = vi.fn();
const mockDestinationOptions = [
  { id: "1", name: "Destination 1" },
  { id: "2", name: "Destination 2" },
];

beforeEach(() => {
  vi.clearAllMocks();

  (useNavigate as any).mockReturnValue(mockNavigate);
  (useDestinations as any).mockReturnValue({
    destinationOptions: mockDestinationOptions,
    isLoading: false,
  });
  (useCreateTravelRequest as any).mockReturnValue({
    createTravelRequestMutation: vi.fn(),
    isPending: false,
  });
  (useUpdateTravelRequest as any).mockReturnValue({
    updateTravelRequestMutation: vi.fn(),
    isPending: false,
  });
});

// Tests

describe("TravelRequestForm", () => {
  it("renders the form with initial values", () => {
    render(<TravelRequestForm />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/anticipo/i)).toBeInTheDocument();
  });

  it("shows validation errors for required fields", async () => {
    render(<TravelRequestForm />);
    await userEvent.click(screen.getByRole("button", { name: /crear solicitud/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/por favor escribe un título/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/por favor escribe un motivo/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/selecciona una fecha de regreso/i)
      ).toBeInTheDocument();
    });
  });

  it("allows adding and removing destinations", async () => {
    render(<TravelRequestForm />);

    await userEvent.click(
      screen.getByRole("button", { name: /agregar destino/i })
    );
    expect(screen.getByText(/destino #2/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    expect(screen.queryByText(/destino #2/i)).not.toBeInTheDocument();
  });

  it("submits the form with valid data and auto-derived stay days", async () => {
    const mockCreateMutation = vi.fn();
    (useCreateTravelRequest as any).mockReturnValue({
      createTravelRequestMutation: mockCreateMutation,
      isPending: false,
    });

    render(<TravelRequestForm />);
    const user = userEvent.setup();

    // basic fields
    await user.type(screen.getByLabelText(/título/i), "Test Trip");
    await user.type(screen.getByLabelText(/motivo/i), "Business Meeting");
    await user.clear(screen.getByLabelText(/anticipo/i));
    await user.type(screen.getByLabelText(/anticipo/i), "1000");

    // origin city dropdown
    const originWrapper = screen.getByTestId("wrapper-id_origin_city");
    await user.click(within(originWrapper).getByRole("option", { name: "Destination 1" }));

    // priority dropdown
    const priorityWrapper = screen.getByTestId("wrapper-priority");
    await user.click(within(priorityWrapper).getByRole("option", { name: "Alta" }));

    // currency dropdown
    const currencyWrapper = screen.getByTestId("wrapper-currency");
    await user.click(within(currencyWrapper).getByRole("option", { name: "MXN - Peso Mexicano" }));

    // destination dropdown inside Destino #1
    const destWrapper = screen.getByTestId("wrapper-destination-0");
    await user.click(within(destWrapper).getByRole("option", { name: "Destination 1" }));

    // remaining fields inside Destino #1
    await user.type(screen.getByLabelText(/detalles/i), "Hotel details");

    // Fill departure date for Destino #1
    await user.type(screen.getByLabelText(/fecha de salida/i), "2026-06-01");

    // Fill return date (trip end)
    await user.type(screen.getByLabelText(/fecha de regreso/i), "2026-06-05");

    // submit 
    await user.click(screen.getByRole("button", { name: /crear solicitud/i }));

    await waitFor(() => {
      expect(mockCreateMutation).toHaveBeenCalledWith({
        id_origin_city: "1",
        title: "Test Trip",
        motive: "Business Meeting",
        priority: "alta",
        advance_money: 1000,
        currency: "MXN",
        requirements: undefined,
        requests_destinations: [
          {
            id_destination: "1",
            destination_order: 1,
            stay_days: 4, // 2026-06-05 - 2026-06-01 = 4 days
            arrival_date: expect.any(String),
            departure_date: expect.any(String),
            is_hotel_required: true,
            is_plane_required: true,
            is_last_destination: true,
            details: "Hotel details",
          },
        ],
      });
    });
  });

  it("handles form submission errors", async () => {
    const mockCreateMutation = vi
      .fn()
      .mockRejectedValue(new Error("API Error"));
    (useCreateTravelRequest as any).mockReturnValue({
      createTravelRequestMutation: mockCreateMutation,
      isPending: false,
    });

    render(<TravelRequestForm />);
    const user = userEvent.setup();

    // Same happy-path typing sequence as above
    await user.type(screen.getByLabelText(/título/i), "Test Trip");
    await user.type(screen.getByLabelText(/motivo/i), "Business Meeting");
    await user.clear(screen.getByLabelText(/anticipo/i));
    await user.type(screen.getByLabelText(/anticipo/i), "1000");

    const originWrapper = screen.getByTestId("wrapper-id_origin_city");
    await user.click(within(originWrapper).getByRole("option", { name: "Destination 1" }));

    const priorityWrapper = screen.getByTestId("wrapper-priority");
    await user.click(within(priorityWrapper).getByRole("option", { name: "Alta" }));

    const currencyWrapper = screen.getByTestId("wrapper-currency");
    await user.click(within(currencyWrapper).getByRole("option", { name: "MXN - Peso Mexicano" }));

    const destWrapper = screen.getByTestId("wrapper-destination-0");
    await user.click(within(destWrapper).getByRole("option", { name: "Destination 1" }));

    await user.type(screen.getByLabelText(/detalles/i), "Hotel details");
    await user.type(screen.getByLabelText(/fecha de salida/i), "2026-06-01");
    await user.type(screen.getByLabelText(/fecha de regreso/i), "2026-06-05");

    await user.click(screen.getByRole("button", { name: /crear solicitud/i }));

    await waitFor(() => expect(mockCreateMutation).toHaveBeenCalled());
  });
});
