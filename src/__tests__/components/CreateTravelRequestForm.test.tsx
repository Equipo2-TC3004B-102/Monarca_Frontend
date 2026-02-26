/**
 * CreateTravelRequestForm.test.tsx
 * Description: Unit/integration-style tests for the CreateTravelRequestForm page.
 * Validates initial render behavior and form validation when submitting without required fields. *
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateTravelRequestForm from '../../components/travel-requests/CreateTravelRequestForm';

/**
 * UI mocks:
 *  - Replace complex UI components with basic HTML elements to make tests more stable and focused.
 *  - Ensure accessibility queries and simple interactions (change/click) behave predictably.
 */

vi.mock('../../components/ui/Input', () => ({
  Input: (p: any) => <input {...p} data-testid="input" />,
}));
vi.mock('../../components/ui/TextArea', () => ({
  TextArea: (p: any) => <textarea {...p} />,
}));
vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
}));
vi.mock('../../components/ui/Select', () => ({
  default: ({ options, onChange, value, 'data-testid': tid = 'select' }: any) => (
    <select
      data-testid={tid}
      value={value?.id ?? ''}
      onChange={(e) => {
        const opt = options.find((o: any) => o.id === e.target.value);
        onChange(opt);
      }}
    >
      <option value="">--</option>
      {options.map((o: any) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('../../components/ui/Switch', () => ({
  default: ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  ),
}));
vi.mock('../../components/ui/FieldError', () => ({
  default: ({ msg }: any) => (msg ? <p>{msg}</p> : null),
}));

/**
 * Hook mocks: Provide deterministic data (destinations) and controlled mutation 
 * behavior (create request).
 */

vi.mock('../../hooks/destinations/useDestinations', () => ({
  useDestinations: () => ({
    destinationOptions: [
      { id: 'MEX', name: 'Ciudad de México' },
      { id: 'CUN', name: 'Cancún' },
    ],
    isLoading: false,
  }),
}));
const mutateSpy = vi.fn();
vi.mock('../../hooks/requests/useCreateRequest', () => ({
  useCreateTravelRequest: () => ({
    createTravelRequestMutation: mutateSpy,
    isPending: false,
  }),
}));

/**
 * Toast mock:
 * Prevent real toast notifications during tests and allow assertions if needed.
 */

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

/**
 * renderPage, renders the CreateTravelRequestForm page inside a MemoryRouter so 
 * routing hooks work properly.
 * Input arguments: None
 * Output: Return value of React Testing Library's render() call.
 * Notes:
 *  - MemoryRouter is used for tests because it does not depend on the browser URL.
 *  - Keeping this helper avoids duplication across tests in this file.
 */

const renderPage = () =>
  render(
    <MemoryRouter>
      <CreateTravelRequestForm />
    </MemoryRouter>
  );


describe('CreateTravelRequestForm – render y validación inicial', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra error si se intenta enviar sin Motivo', async () => {
    renderPage();

    fireEvent.click(screen.getByText(/Crear viaje/i));

    await waitFor(() =>
      expect(
        screen.getByText(/Escribe el motivo del viaje/i)
      ).toBeInTheDocument()
    );

    expect(mutateSpy).not.toHaveBeenCalled();
  });
});
