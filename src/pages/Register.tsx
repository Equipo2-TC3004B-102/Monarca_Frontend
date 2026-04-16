/**
 * FileName: Register.tsx
 * Description: Renders the registration page with a form for new users to create an account, including fields for email and password, and links to the login page for existing users.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div
      className="flex flex-col lg:flex-row h-screen w-[100%]"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="w-[90%] lg:w-[45%] bg-[url('/imageLogin.png')] bg-center bg-cover bg-no-repeat rounded-[15px] h-[10%] lg:h-[95%] m-[2vh]"></div>
      <div className="w-[100%] lg:w-[55%] flex flex-col justify-center items-center p-12 relative">
        <p
          className="text-[2rem] lg:text-[2.5rem] absolute top-8 right-12"
          style={{ fontWeight: 700 }}
        >
          <span className="text-[#0466CB]">M</span>ONARCA
        </p>
        <h1
          className="text-[2.5rem] lg:text-[3.5rem] text-[#001d3d] text-center mb-8 mt-20"
          style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700 }}
        >
          ¿Olvidaste tu contraseña?
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md items-center">
          <h3 className="text-[#001d3d] mb-6 text-lg font-medium">
            Ingresa tu correo electrónico con el cual inicias sesión para
            recuperar tu contraseña.
          </h3>
          <input
            type="email"
            placeholder="Correo"
            required
            className="p-4 w-[100%] border border-[#E0E0E0] rounded-[0.5rem] bg-[#F0F3F4] shadow-[0_2px_1px_rgba(0,0,0,0.3)] text-[1rem] lg:text-[1.2rem] mb-8"
          />

          <p className="text-[18px] text-center mb-[50px] text-[1rem] lg:text-[1.2rem]">
            ¿Ya tienes cuenta?&nbsp;
            <Link className="!underline font-semibold" to="/">
              Inicia sesión
            </Link>
          </p>

          <button
            type="submit"
            className="bg-[#00296B] text-white py-4 px-6 rounded-[0.5rem] font-semibold cursor-pointer text-[0.9rem] lg:text-[1rem] text-center w-[50%] lg:w-[30%] hover:bg-[#00509D]"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
