/**
 * Approvals.test.tsx
 * Description: Test suite for the Approvals page component. Verifies rendering, data fetching, and column/row mapping passed to the Table component.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApprovalsPage from '../../pages/Approvals/Approvals';

/* ══════════════════════════════════════════════════════════════
   1. Mocks
   ══════════════════════════════════════════════════════════════ */

// API – data defined inside the factory to avoid hoisting issues
vi.mock('../../utils/apiService', () => {
  const mockTrips = [
    {
      id: 10,
      status: 'Pending',
      motive: 'Viaje de negocio',
      title: 'Visita a planta',
      destination: { city: 'CDMX' },
      requests_destinations: [
        { destination_order: 2, departure_date: '2025-07-10' },
        { destination_order: 1, departure_date: '2025-07-05' },
      ],
    },
  ];
  return { getRequest: vi.fn().mockResolvedValue(mockTrips) };
});

// formatDate mock
vi.mock('../../utils/formatDate', () => ({
  default: (d: string) => `f-${d}`,
}));

// Table spy mock
let tableSpy = vi.fn();
vi.mock('../../components/Approvals/Table', () => ({
  default: (props: any) => {
    tableSpy(props);
    return <div data-testid="table" />;
  },
}));

// UI placeholder mocks
vi.mock('../../components/RefreshButton', () => ({
  default: () => <button data-testid="refresh" />,
}));
vi.mock('../../components/GoBack', () => ({
  default: () => <div data-testid="goback" />,
}));

/* ══════════════════════════════════════════════════════════════
   2. Helper render function
   ══════════════════════════════════════════════════════════════ */
/**
 * Renders the ApprovalsPage wrapped in a MemoryRouter for isolated testing.
 * @returns The rendered component result
 */
const renderPage = () =>
  render(
    <MemoryRouter>
      <ApprovalsPage />
    </MemoryRouter>
  );

/* ══════════════════════════════════════════════════════════════
   3. Tests
   ══════════════════════════════════════════════════════════════ */
describe('Approvals page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableSpy.mockClear();
  });

  it('renders title, refresh button and passes mapped data to Table', async () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: /viajes por aprobar/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('refresh')).toBeInTheDocument();

    // Wait for Table to receive a dataset with at least one row
    await waitFor(() =>
      expect(
        tableSpy.mock.calls.find((c) => c[0].data.length > 0)
      ).toBeTruthy()
    );

    // Use the LAST call (already populated with data)
    const lastCall = tableSpy.mock.calls.at(-1)![0];
    const { data, columns, link } = lastCall;

    expect(link).toBe('/requests');
    expect(columns.map((c: any) => c.key)).toEqual([
      'status',
      'motive',
      'title',
      'departureDate',
      'country',
    ]);

    const row = data[0];
    expect(row.country).toBe('CDMX');
    expect(row.departureDate).toBe('f-2025-07-05');
  });
});
