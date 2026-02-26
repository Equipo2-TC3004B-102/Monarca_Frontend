/**
 * CreateTravelRequest.test.tsx
 * Description: Test suite for the CreateTravelRequest page component. Verifies that the TravelRequestForm is mounted correctly.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateTravelRequest from '../../pages/CreateTravelRequest';

/* ══════════════════════════════════════════════════════════════
   1. Mock the form component
   We do not need the real implementation; it is enough to know it mounts.
   ══════════════════════════════════════════════════════════════ */
vi.mock(
  '../../components/travel-requests/TravelRequestForm',
  () => ({
    default: () => <div data-testid="travel-request-form" />
  })
);

/* ══════════════════════════════════════════════════════════════
   2. Tests
   ══════════════════════════════════════════════════════════════ */
describe('CreateTravelRequest page', () => {
  it('renders the TravelRequestForm', () => {
    render(
      <MemoryRouter>
        <CreateTravelRequest />
      </MemoryRouter>
    );

    expect(
      screen.getByTestId('travel-request-form')
    ).toBeInTheDocument();
  });
});
