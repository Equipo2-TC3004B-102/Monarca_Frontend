/**
 * EditTravelRequest.test.tsx
 * Description: Test suite for the EditTravelRequest page component. Covers loading state, missing request error, and successful form rendering with fetched data.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditTravelRequest from '../../pages/EditTravelRequest';

/* ══════════════════════════════════════════════════════════════
   1. Dependency mocks
   ══════════════════════════════════════════════════════════════ */

// useParams: always returns id = "123"
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return { ...actual, useParams: () => ({ id: '123' }) };
});

// useGetRequest: overridden in each test
vi.mock('../../hooks/requests/useGetRequest', () => ({
  useGetRequest: vi.fn(),
}));
import { useGetRequest } from '../../hooks/requests/useGetRequest';

// TravelRequestForm: internal logic not needed for these tests
vi.mock(
  '../../components/travel-requests/TravelRequestForm',
  () => ({
    default: ({ requestId }: { requestId?: string }) => (
      <div data-testid="travel-form">{requestId}</div>
    ),
  })
);

/* ══════════════════════════════════════════════════════════════
   2. Helper render function
   ══════════════════════════════════════════════════════════════ */
/**
 * Renders the EditTravelRequest page wrapped in a MemoryRouter.
 * @returns The rendered component result
 */
const renderPage = () =>
  render(
    <MemoryRouter>
      <EditTravelRequest />
    </MemoryRouter>
  );

/* ══════════════════════════════════════════════════════════════
   3. Tests
   ══════════════════════════════════════════════════════════════ */
describe('EditTravelRequest page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading indicator while isLoading is true', () => {
    // @ts-expect-error – redefining the mock return value
    useGetRequest.mockReturnValue({ data: undefined, isLoading: true });

    renderPage();

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('shows error message when no request is found', () => {
    // @ts-expect-error
    useGetRequest.mockReturnValue({ data: undefined, isLoading: false });

    renderPage();

    expect(
      screen.getByText('No se encontró la solicitud de viaje')
    ).toBeInTheDocument();
  });

  it('renders TravelRequestForm with data when loaded successfully', () => {
    const fakeRequest = { id: 123, admin: 'Test' };

    // @ts-expect-error
    useGetRequest.mockReturnValue({ data: fakeRequest, isLoading: false });

    renderPage();

    const travelForm = screen.getByTestId('travel-form');
    expect(travelForm).toBeInTheDocument();
    // The mock renders the id so we can verify it
    expect(travelForm).toHaveTextContent('123');
  });
});
