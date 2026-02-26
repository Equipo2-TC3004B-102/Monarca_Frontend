/**
 * RefundsReview.test.tsx
 * Description: Test suite for the RefundsReview page component. Covers loading indicator, data rendering in Table, status filtering, and navigation on button click.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RefundsReview from '../../pages/Refunds/RefundsReview';

/* ══════════════════════════════════════════════════════════════
   react-router mocks
   ══════════════════════════════════════════════════════════════ */
const navigateSpy = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return { ...actual, useNavigate: () => navigateSpy };
});

/* ══════════════════════════════════════════════════════════════
   UI component mocks
   ══════════════════════════════════════════════════════════════ */
vi.mock('../../components/GoBack', () => ({ default: () => <div /> }));
vi.mock('../../components/RefreshButton', () => ({
  default: () => <button data-testid="refresh" />,
}));

const tableSpy = vi.fn();
vi.mock('../../components/Refunds/Table', () => ({
  default: (props: any) => (tableSpy(props), <div data-testid="table" />),
}));

/* ══════════════════════════════════════════════════════════════
   apiService mock (avoids TDZ)
   ══════════════════════════════════════════════════════════════ */
var getRequestMock: Mock;
vi.mock('../../utils/apiService', () => {
  getRequestMock = vi.fn();
  return { getRequest: getRequestMock };
});

/* ══════════════════════════════════════════════════════════════
   Helper render function
   ══════════════════════════════════════════════════════════════ */
/**
 * Renders the RefundsReview page wrapped in a MemoryRouter.
 * @returns The rendered component result
 */
const renderPage = () =>
  render(
    <MemoryRouter>
      <RefundsReview />
    </MemoryRouter>
  );

/* ══════════════════════════════════════════════════════════════
   Tests
   ══════════════════════════════════════════════════════════════ */
describe('RefundsReview page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableSpy.mockClear();
    navigateSpy.mockClear();
  });

  it('shows loading indicator and then renders table with data', async () => {
    // Minimal dataset for loading
    getRequestMock.mockResolvedValueOnce([
      {
        id: '001',
        title: 'Viaje a Cancún',
        status: 'Pending Vouchers Approval',
        advance_money: 1234.5,
        createdAt: '2025-04-01',
        destination: { city: 'MTY' },
        requests_destinations: [
          { destination_order: 1, departure_date: '2025-05-10' },
        ],
      },
    ]);

    renderPage();

    // Loading indicator is visible
    expect(
      screen.getByText(/Cargando datos de viajes/i)
    ).toBeInTheDocument();

    // Wait for Table to render
    await waitFor(() => expect(tableSpy).toHaveBeenCalled());

    // Verify data passed to table
    const { data } = tableSpy.mock.calls.at(-1)![0];
    expect(data[0]).toMatchObject({
      id: '001',
      title: 'Viaje a Cancún',
    });
    expect(data[0].action.props.label).toBe('Ver comprobantes');
  });

  it('filters by status and navigates on "Ver comprobantes" click', async () => {
    // Dataset with 3 different statuses
    getRequestMock.mockResolvedValueOnce([
      {
        id: 'A1',
        title: 'Viaje válido',
        status: 'Pending Vouchers Approval', // should remain
        advance_money: 0,
        createdAt: '2025-04-01',
        destination: { city: 'MEX' },
        requests_destinations: [
          { destination_order: 1, departure_date: '2025-04-10' },
        ],
      },
      {
        id: 'B2',
        title: 'Viaje aprobado',
        status: 'Approved', // should be filtered out
        advance_money: 0,
        createdAt: '2025-04-02',
        destination: { city: 'GDL' },
        requests_destinations: [
          { destination_order: 1, departure_date: '2025-04-11' },
        ],
      },
      {
        id: 'C3',
        title: 'Viaje pendiente',
        status: 'Pending Review', // should be filtered out
        advance_money: 0,
        createdAt: '2025-04-03',
        destination: { city: 'CUN' },
        requests_destinations: [
          { destination_order: 1, departure_date: '2025-04-12' },
        ],
      },
    ]);

    renderPage();
    await waitFor(() => expect(tableSpy).toHaveBeenCalled());

    const { data } = tableSpy.mock.calls.at(-1)![0];

    // Only trip 'A1' remains after filtering
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('A1');

    // Simulate click and verify navigation
    data[0].action.props.onClickFunction();
    expect(navigateSpy).toHaveBeenCalledWith('/refunds-review/A1');
  });
});
