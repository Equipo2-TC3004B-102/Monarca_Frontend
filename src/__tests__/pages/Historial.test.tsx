/**
 * Historial.test.tsx
 * Description: Test suite for the Historial (History) page component. Covers navigation and data filtering based on user permissions.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HistorialPage from '../../pages/Historial/Historial';

/* ═══════════════════════════════════════════════════════════════
   1. authContext managed via mutable variable
   ═══════════════════════════════════════════════════════════════ */
let mockAuth = { userId: '0', userPermissions: [] as string[] };
vi.mock('../../hooks/auth/authContext', () => ({
  useAuth: () => ({ authState: mockAuth }),
}));

/* ═══════════════════════════════════════════════════════════════
   2. navigate spy
   ═══════════════════════════════════════════════════════════════ */
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return { ...actual, useNavigate: () => mockedNavigate };
});

/* ═══════════════════════════════════════════════════════════════
   3. apiService – avoids TDZ and is typed
   ═══════════════════════════════════════════════════════════════ */
var getRequestMock: Mock; // hoisted, typed

vi.mock('../../utils/apiService', () => {
  getRequestMock = vi.fn();
  return { getRequest: getRequestMock };
});

/* ── base dataset and reset ─────────────────────────────────── */
const baseTrips = [
  {
    id: 1,
    status: 'Approved',
    motive: 'Negocio',
    title: 'Reunión Monterrey',
    createdAt: '2025-06-01',
    destination: { city: 'CDMX' },
    requests_destinations: [
      { destination_order: 1, departure_date: '2025-07-10' },
    ],
    id_admin: '999',
    travel_agency: { users: [] },
    id_SOI: '888',
  },
  {
    id: 2,
    status: 'Pending Review',
    motive: 'Capacitación',
    title: 'Curso Puebla',
    createdAt: '2025-05-15',
    destination: { city: 'PUE' },
    requests_destinations: [
      { destination_order: 1, departure_date: '2025-06-20' },
    ],
    id_admin: '999',
    travel_agency: { users: [] },
    id_SOI: '888',
  },
];

/* ═══════════════════════════════════════════════════════════════
   4. Other utility and UI mocks
   ═══════════════════════════════════════════════════════════════ */
vi.mock('../../utils/formatDate', () => ({ default: (d: string) => `f-${d}` }));

const tableSpy = vi.fn();
vi.mock('../../components/Refunds/Table', () => ({
  default: (props: any) => (tableSpy(props), <div data-testid="table" />),
}));

vi.mock('../../components/Refunds/Button', () => ({
  default: ({ onClickFunction }: any) => (
    <button onClick={onClickFunction}>detalles</button>
  ),
}));

vi.mock('../../components/GoBack', () => ({ default: () => <div /> }));
vi.mock('../../components/RefreshButton', () => ({
  default: () => <button data-testid="refresh" />,
}));

/* ═══════════════════════════════════════════════════════════════
   Helper render function
   ═══════════════════════════════════════════════════════════════ */
/**
 * Renders the HistorialPage wrapped in a MemoryRouter for isolated testing.
 * @returns The rendered component result
 */
const renderPage = () =>
  render(
    <MemoryRouter>
      <HistorialPage />
    </MemoryRouter>
  );

/* ═══════════════════════════════════════════════════════════════
   TESTS
   ═══════════════════════════════════════════════════════════════ */
describe('Historial page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableSpy.mockClear();
    mockedNavigate.mockClear();
    mockAuth = { userId: '0', userPermissions: [] };
    getRequestMock.mockReset().mockResolvedValue(baseTrips);
  });

  it('create_request navigates to request details', async () => {
    mockAuth = { userId: '42', userPermissions: ['create_request'] };

    renderPage();
    await waitFor(() => expect(tableSpy).toHaveBeenCalled());

    const { data } = tableSpy.mock.calls.at(-1)![0];
    data[0].action.props.onClickFunction();
    expect(mockedNavigate).toHaveBeenCalledWith('/requests/1');
  });

  it('approve_request filters out Pending Review trips', async () => {
    mockAuth = { userId: '999', userPermissions: ['approve_request'] };

    renderPage();
    await waitFor(() => expect(tableSpy).toHaveBeenCalled());

    const { data } = tableSpy.mock.calls.at(-1)![0];
    expect(data.map((r: any) => r.id)).toEqual([1]);
  });

  it('check_budgets uses /to-approve-SOI endpoint and filters results', async () => {
    mockAuth = { userId: '888', userPermissions: ['check_budgets'] };

    renderPage();
    await waitFor(() => expect(tableSpy).toHaveBeenCalled());

    expect(getRequestMock).toHaveBeenCalledWith('/requests/to-approve-SOI');
    const { data } = tableSpy.mock.calls.at(-1)![0];
    expect(data).toHaveLength(0);
  });

  it('submit_reservations keeps only Approved trips', async () => {
    getRequestMock.mockResolvedValueOnce([
      {
        id: 3,
        status: 'Approved',
        destination: { city: 'GDL' },
        createdAt: '2025-04-12',
        requests_destinations: [
          { destination_order: 1, departure_date: '2025-05-01' },
        ],
        travel_agency: { users: [{ id: '777' }] },
      },
      {
        id: 4,
        status: 'Pending Reservations',
        destination: { city: 'LEN' },
        createdAt: '2025-04-13',
        requests_destinations: [
          { destination_order: 1, departure_date: '2025-05-02' },
        ],
        travel_agency: { users: [{ id: '777' }] },
      },
    ]);
    mockAuth = { userId: '777', userPermissions: ['submit_reservations'] };

    renderPage();
    await waitFor(() => expect(tableSpy).toHaveBeenCalled());

    const { data } = tableSpy.mock.calls.at(-1)![0];
    expect(data.map((r: any) => r.id)).toEqual([3]);
  });
});
