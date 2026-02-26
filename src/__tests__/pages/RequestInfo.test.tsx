/**
 * RequestInfo.test.tsx
 * Description: Test suite for the RequestInfo page component. Covers approval, change request, denial, cancellation, accounting registration flows, and tag rendering.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequestInfo from '../../pages/RequestInfo';

/* ══════════════════════════════════════════════════════════════
   Control variables (changed per test)
   ══════════════════════════════════════════════════════════════ */
let mockPermissions: string[] = ['approve_request'];
let mockRequestPayload: any = {}; // assigned in each test

/* ══════════════════════════════════════════════════════════════
   1. Global mocks
   ══════════════════════════════════════════════════════════════ */

// useParams → always id=123
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return { ...actual, useParams: () => ({ id: '123' }) };
});

// authContext: variable permissions
vi.mock('../../hooks/auth/authContext', () => ({
  useAuth: () => ({
    authState: { userId: '999', userPermissions: mockPermissions },
  }),
}));

// react-toastify
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// Swiper
vi.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => <div>{children}</div>,
  SwiperSlide: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('swiper/modules', () => ({ Navigation: {}, Pagination: {} }));

// apiService
vi.mock('../../utils/apiService', () => {
  const agencies = [
    { id: 'A1', name: 'Best Travel' },
    { id: 'A2', name: 'Fly High' },
  ];

  return {
    getRequest: vi.fn().mockImplementation((url: string) => {
      if (url.startsWith('/travel-agencies')) return Promise.resolve(agencies);
      return Promise.resolve(mockRequestPayload);
    }),
    patchRequest: vi.fn().mockResolvedValue({}),
    postRequest: vi.fn().mockResolvedValue({}),
  };
});
import * as apiService from '../../utils/apiService';

/* ══════════════════════════════════════════════════════════════
   2. Helper render function
   ══════════════════════════════════════════════════════════════ */
/**
 * Renders the RequestInfo page with the route /requests/123 for isolated testing.
 * @returns The rendered component result
 */
const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/requests/123']}>
      <Routes>
        <Route path="/requests/:id" element={<RequestInfo />} />
      </Routes>
    </MemoryRouter>
  );

/* ══════════════════════════════════════════════════════════════
   3. Reusable base request data
   ══════════════════════════════════════════════════════════════ */
const baseRequest = {
  id: 123,
  createdAt: '2025-05-28T12:00:00Z',
  advance_money: 1000,
  admin: { name: 'Juan', last_name: 'Pérez' },
  destination: { city: 'CDMX' },
  requests_destinations: [
    {
      id: 1,
      destination: { city: 'Monterrey' },
      arrival_date: '2025-06-01',
      departure_date: '2025-06-03',
      details: 'Reunión con cliente',
      is_hotel_required: true,
      is_plane_required: true,
      stay_days: 2,
    },
  ],
  revisions: [],
  vouchers: [{ status: 'Voucher Approved', amount: 800, id: 77, file_url: '' }],
  status: 'Pending Review',
  id_travel_agency: null,
};

/* ══════════════════════════════════════════════════════════════
   4. Tests
   ══════════════════════════════════════════════════════════════ */
describe('RequestInfo – full coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPermissions = ['approve_request']; // default permission
    mockRequestPayload = { ...baseRequest }; // clean copy
  });

  /* A. Approve */
  it('approval flow', async () => {
    renderPage();

    await userEvent.selectOptions(
      await screen.findByRole('combobox'),
      'A1'
    );
    await userEvent.click(screen.getByRole('button', { name: /aprobar/i }));

    await waitFor(() =>
      expect(apiService.patchRequest).toHaveBeenCalledWith(
        '/requests/approve/123',
        { id_travel_agency: 'A1' }
      )
    );
  });

  /* B. Request changes */
  it('request changes flow', async () => {
    renderPage();

    await userEvent.type(
      await screen.findByRole('textbox', { name: /comentarios/i }),
      'Cambiar fechas'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /solicitar cambios/i })
    );

    await waitFor(() =>
      expect(apiService.postRequest).toHaveBeenCalledWith('/revisions', {
        id_request: '123',
        comment: 'Cambiar fechas',
      })
    );
  });

  /* C. Deny */
  it('denial flow', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /denegar/i }));

    await waitFor(() =>
      expect(apiService.patchRequest).toHaveBeenCalledWith(
        '/requests/deny/123',
        {}
      )
    );
  });

  /* D. Cancel (requires create_request permission) */
  it('cancellation flow with create_request permission', async () => {
    mockPermissions = ['create_request'];
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() =>
      expect(apiService.patchRequest).toHaveBeenCalledWith(
        '/requests/cancel/123',
        {}
      )
    );
  });

  /* E. Register (check_budgets permission, Pending Accounting Approval status) */
  it('mark as registered flow', async () => {
    mockPermissions = ['check_budgets'];
    mockRequestPayload = { ...baseRequest, status: 'Pending Accounting Approval' };

    renderPage();

    await userEvent.click(
      await screen.findByRole('button', { name: /marcar como registrado/i })
    );

    await waitFor(() =>
      expect(apiService.patchRequest).toHaveBeenCalledWith(
        '/requests/SOI-approve/123',
        {}
      )
    );
  });

  /* F. Verify tag rendering and balance calculation */
  it('shows hotel/plane tags and positive balance', async () => {
    mockRequestPayload = {
      ...baseRequest,
      advance_money: 500,
      vouchers: [{ status: 'Voucher Approved', amount: 800, id: 1, file_url: '' }],
    };
    renderPage();

    expect(await screen.findByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Avión')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/\$?300\.00/)).toHaveClass('text-green-600');
  });

  /* G. Approve button remains disabled when no agency is selected */
  it('keeps "Aprobar" button disabled when no agency is selected', async () => {
    renderPage();

    const approveButton = await screen.findByRole('button', { name: /aprobar/i });
    expect(approveButton).toBeDisabled();

    // Click attempt must not trigger the service call
    await userEvent.click(approveButton);
    expect(apiService.patchRequest).not.toHaveBeenCalled();
  });
});
