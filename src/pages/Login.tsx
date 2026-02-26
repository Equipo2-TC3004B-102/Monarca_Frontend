/**
 * Login.tsx
 * Description: Login page component that authenticates a user via the backend API and redirects to the dashboard on success. Displays toast notifications for validation and authentication errors.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apiService";
import { ToastContainer, toast } from "react-toastify";

/**
 * User, represents the login form payload.
 * Input:
 * - email (string): User email used for authentication.
 * - password (string): User password used for authentication.
 * Output: User interface - Used for typing form state and API payload.
 */
interface User {
  email: string;
  password: string;
}

/**
 * LoginPage, renders the login UI and handles authentication flow.
 * Input: None.
 * Output: JSX.Element - Login form UI with toast notifications and navigation on success.
 *
 * Business logic:
 * - Validates that both email and password are present before sending the request.
 * - Calls POST /login with the provided credentials.
 * - On success (result.status === true), navigates to /dashboard.
 * - On failure, shows an error toast with a user-friendly message.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    email: "",
    password: "",
  });

  /**
   * handleSubmit, validates input fields and performs login request to the API.
   * Input:
   * - event (React.FormEvent<HTMLFormElement>): Form submit event.
   * Output: Promise<void> - Navigates on success, shows toast messages on validation or request errors.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user.email || !user.password) {
      toast.error("Por favor, completa todos los campos", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    // Send request to API
    try {
      const result = await postRequest("/login", { ...user });
      if (result.status) {
        navigate("/dashboard");
      } else {
        console.log(result);
        toast.error("Credenciales incorrectas", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al iniciar sesión", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /**
   * handleChange, updates form state when the user types in an input field.
   * Input:
   * - event (React.ChangeEvent<HTMLInputElement>): Change event from an input element.
   * Output: void - Updates the "user" state with the new field value.
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div
      className="flex h-screen"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="w-[45%] bg-[url('/imageLogin.png')] bg-center bg-cover bg-no-repeat rounded-[15px] h-[96vh] m-[2vh]"></div>
      <div className="w-[55%] flex flex-col justify-center p-12 relative">
        <p
          className="text-[2.5rem] absolute top-8 right-12"
          style={{ fontWeight: 700 }}
        >
          <span className="text-[#0466CB]">M</span>ONARCA
        </p>
        <ToastContainer />
        <h1
          className="text-[3.5rem] text-[#001d3d] mb-8 mt-20"
          style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700 }}
        >
          INICIO DE SESIÓN
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col max-w-[490px] text-[#001D3D]"
        >
          <input
            onChange={handleChange}
            name="email"
            type="email"
            placeholder="Correo"
            required
            className="p-4 border border-[#E0E0E0] rounded-[0.5rem] bg-[#F0F3F4] shadow-[0_2px_1px_rgba(0,0,0,0.3)] text-[1.2rem] mb-8"
          />
          <input
            onChange={handleChange}
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            className="p-4 border border-[#E0E0E0] rounded-[0.5rem] bg-[#F0F3F4] shadow-[0_2px_1px_rgba(0,0,0,0.3)] text-[1.2rem] mb-4"
          />
          <a
            href="/register"
            className="text-[18px] text-left mb-[150px] underline-offset-2 hover:!underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
          <button
            type="submit"
            className="bg-[#00296B] text-white py-4 px-6 rounded-[0.5rem] font-semibold cursor-pointer text-left w-[60%] hover:bg-[#00509D]"
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}
