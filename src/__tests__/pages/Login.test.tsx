/**
 * Login.test.tsx
 * Description: Test suite for the Login page component. Covers form rendering, user input, successful login navigation, and error handling via toast notifications.
 * Authors: Monarca Original Team
 * Last Modification made:
 * 26/02/2026 [Fausto Izquierdo] Added detailed comments and documentation for clarity and maintainability.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/Login';

/* ══════════════════════════════════════════════════════════════
   1. Global mocks
   ══════════════════════════════════════════════════════════════ */

// navigate mock
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return { ...actual, useNavigate: () => mockedNavigate };
});

// apiService mock
vi.mock('../../utils/apiService', () => ({ postRequest: vi.fn() }));

// react-toastify mock
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn() },
  ToastContainer: () => null,
}));

/* ══════════════════════════════════════════════════════════════
   2. Typed access to mocks
   ══════════════════════════════════════════════════════════════ */
import * as apiServiceOrig from '../../utils/apiService';
import { toast } from 'react-toastify';
const apiService = vi.mocked(apiServiceOrig);

/* ══════════════════════════════════════════════════════════════
   3. Helper render function
   ══════════════════════════════════════════════════════════════ */
/**
 * Renders the LoginPage wrapped in a BrowserRouter for isolated testing.
 * @returns The rendered component result
 */
const renderLogin = () =>
  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );

/* ══════════════════════════════════════════════════════════════
   4. Tests
   ══════════════════════════════════════════════════════════════ */
describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  /* ---------- BASIC RENDER ---------- */
  it('renders basic form elements', () => {
    renderLogin();

    expect(screen.getByText('INICIO DE SESIÓN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Continuar')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('ONARCA')).toBeInTheDocument();
    const forgotLink = screen.getByText('¿Olvidaste tu contraseña?');
    expect(forgotLink).toHaveAttribute('href', '/register');
  });

  /* ---------- INPUT INTERACTION ---------- */
  it('updates inputs on user typing', async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText('Correo');
    const passwordInput = screen.getByPlaceholderText('Contraseña');

    await userEvent.type(emailInput, 'user@test.com');
    await userEvent.type(passwordInput, '123456');

    expect(emailInput).toHaveValue('user@test.com');
    expect(passwordInput).toHaveValue('123456');
  });

  /* ---------- SUCCESSFUL LOGIN ---------- */
  it('navigates to dashboard on successful login', async () => {
    apiService.postRequest.mockResolvedValueOnce({ status: true });

    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('Correo'), 'ok@test.com');
    await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password');

    await userEvent.click(screen.getByText('Continuar'));

    expect(apiService.postRequest).toHaveBeenCalledWith('/login', {
      email: 'ok@test.com',
      password: 'password',
    });
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
  });

  /* ---------- EMPTY FIELDS ---------- */
  it('shows toast if form is submitted with empty fields', async () => {
    renderLogin();

    // Disable native HTML5 validation
    const form = document.querySelector('form') as HTMLFormElement;
    form.noValidate = true;

    await userEvent.click(screen.getByText('Continuar'));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Por favor, completa todos los campos',
        expect.any(Object)
      )
    );
    expect(apiService.postRequest).not.toHaveBeenCalled();
  });

  /* ---------- WRONG CREDENTIALS ---------- */
  it('shows toast if API returns status false', async () => {
    apiService.postRequest.mockResolvedValueOnce({ status: false });

    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('Correo'), 'wrong@test.com');
    await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'wrongpass');

    await userEvent.click(screen.getByText('Continuar'));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Credenciales incorrectas',
        expect.any(Object)
      )
    );
  });

  /* ---------- SERVER ERROR ---------- */
  it('shows generic toast if the request fails', async () => {
    apiService.postRequest.mockRejectedValueOnce(new Error('network'));

    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('Correo'), 'fail@test.com');
    await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'failpass');

    await userEvent.click(screen.getByText('Continuar'));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Error al iniciar sesión',
        expect.any(Object)
      )
    );
  });

  /* ---------- PERSISTENCE AFTER RERENDER ---------- */
  it('retains input values after rerender', async () => {
    const { rerender } = renderLogin();

    const emailInput = screen.getByPlaceholderText('Correo');
    const passwordInput = screen.getByPlaceholderText('Contraseña');

    await userEvent.type(emailInput, 'persist@example.com');
    await userEvent.type(passwordInput, 'persistpw');

    rerender(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Correo')).toHaveValue(
      'persist@example.com'
    );
    expect(screen.getByPlaceholderText('Contraseña')).toHaveValue('persistpw');
  });
});
