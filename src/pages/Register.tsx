/**
 * FileName: Register.tsx
 * Description: Renders the registration page with a form for new users to create an account, including fields for email and password, and links to the login page for existing users.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Rounded input borders and dark mode focus ring, matching Login.tsx.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import DarkModeButton from "../components/DarkLightButton";

/**
 * RegisterPage Component
 * Purpose: Renders a password recovery page with a form for users to enter their email address
 * to recover their forgotten password. Includes dark mode toggle, language switch and link back to login.
 * Inputs: None
 * Outputs:
 * {JSX.Element} A password recovery form page with email input field and submit button
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    const next = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(next);
    localStorage.setItem("language", next);
  };

  /**
   * handleSubmit Function
   * Purpose: Handles form submission for password recovery by preventing default form behavior
   * and navigating to the dashboard page.
   * Inputs:
   * React.FormEvent<HTMLFormElement> event - The form submission event
   * Outputs:
   * void - Navigates to dashboard route
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    navigate("/dashboard");
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center px-6 py-10 overflow-hidden"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {/* Gradient light */}
      <div
        className="absolute inset-0 transition-opacity duration-500 dark:opacity-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #00296b 0%, #0466cb 28%, #4d9aff 55%, #cfe2ff 78%, #ddeaff 100%)" }}
      />
      {/* Gradient dark */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 dark:opacity-100 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #001233 0%, #00204d 28%, #002d6b 55%, #003580 78%, #001a45 100%)" }}
      />

      {/* Wave layers */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,520 C240,440 480,640 720,560 C960,480 1200,620 1440,540 L1440,900 L0,900 Z"
          fill="rgba(255,255,255,0.18)"
        />
        <path
          d="M0,640 C300,560 540,740 800,660 C1060,580 1240,720 1440,660 L1440,900 L0,900 Z"
          fill="rgba(255,255,255,0.35)"
        />
        <path
          d="M0,760 C260,700 520,840 800,780 C1080,720 1260,820 1440,780 L1440,900 L0,900 Z"
          fill="rgba(255,255,255,0.6)"
        />
        <path
          d="M0,300 C200,260 380,360 600,320 C820,280 1040,360 1240,310 C1340,290 1400,310 1440,300 L1440,0 L0,0 Z"
          fill="rgba(255,255,255,0.06)"
        />
      </svg>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .anim-fade { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .field {
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 0.5rem;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
          transition: border-color 0.25s ease;
        }
        .field:focus-within {
          border-color: #001d3d;
        }
        .dark .field:focus-within {
          border-color: #4d9aff;
        }
        .field input {
          background: transparent;
          color: var(--color-page-text, #001d3d);
          outline: none;
          border: none;
          box-shadow: none;
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
        }
        .field input:focus,
        .field input:focus-visible {
          outline: none;
          box-shadow: none;
          border: none;
        }
        .field input::placeholder { color: #9ca3af; }
        .submit-btn {
          background: #001d3d;
          transition: all 0.25s ease;
        }
        .submit-btn:hover:not(:disabled) {
          background: #00296b;
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .link-underline {
          position: relative;
        }
        .link-underline::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }
        .link-underline:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      `}</style>

      {/* Top-right controls: brand + dark mode + language */}
      <div
        className="absolute top-7 lg:top-8 left-6 lg:left-12 z-50 anim-fade"
        style={{ animationDelay: "0.05s" }}
      >
        <span
          className="text-white text-2xl tracking-[0.3em]"
          style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 600 }}
        >
          <span style={{ color: "#4d9aff" }}>M</span>ONARCA
        </span>
      </div>

      <div
        className="absolute top-7 lg:top-8 right-6 lg:right-12 z-50 flex items-center gap-4 anim-fade"
        style={{ animationDelay: "0.05s" }}
      >
        <DarkModeButton className="flex items-center -mt-1"></DarkModeButton>
        <button
          type="button"
          title={i18n.language === "es" ? "Switch to English" : "Cambiar a Español"}
          onClick={toggleLanguage}
          className="hover:scale-110 transition-transform"
        >
          <img
            src={i18n.language === "es" ? "/assets/flag_es.svg" : "/assets/flag_gb.svg"}
            alt={i18n.language === "es" ? "Español" : "English"}
            className="w-10 h-7 rounded-sm object-cover shadow-sm"
          />
        </button>
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-[440px] anim-fade z-10 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-10 lg:p-12 transition-colors duration-500"
        style={{
          animationDelay: "0.15s",
          boxShadow: "0 20px 60px -20px rgba(0, 29, 61, 0.25)",
        }}
      >
        <div className="mb-12">
          <span
            className="text-[#0466cb] text-[0.7rem] tracking-[0.35em] uppercase block mb-4"
            style={{ fontWeight: 600 }}
          >
            {t("recover.eyebrow", "Recuperación")}
          </span>
          <h1
            className="text-[var(--color-page-text-title)] text-[2.5rem] leading-[1.05]"
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {t("recover.title", "¿Olvidaste tu contraseña?")}
          </h1>
          <p className="text-gray-500 text-sm mt-3">
            {t(
              "recover.subtitle",
              "Ingresa tu correo electrónico con el cual inicias sesión para recuperar tu contraseña."
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* Email */}
          <div>
            <label
              className="block text-[0.7rem] tracking-[0.2em] uppercase text-gray-500 mb-2"
              style={{ fontWeight: 600 }}
            >
              {t("login.email", "Correo")}
            </label>
            <div className="field py-2">
              <input
                name="email"
                type="email"
                required
                placeholder={t("login.emailPlaceholder")}
                autoComplete="email"
                className="text-[0.95rem]"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn text-white rounded-md h-[52px] flex items-center justify-center gap-3 text-[0.85rem] tracking-[0.15em] uppercase mt-4"
            style={{ fontWeight: 600 }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>{t("recover.sending", "Enviando")}</span>
              </>
            ) : (
              <>
                <span>{t("recover.send", "Enviar")}</span>
                <FiArrowRight style={{ width: 16, height: 16 }} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-8">
          {t("recover.haveAccount", "¿Ya tienes cuenta?")}{" "}
          <Link
            to="/"
            className="link-underline text-[var(--color-page-text-title)]"
            style={{ fontWeight: 600 }}
          >
            {t("login.signIn", "Inicia sesión")}
          </Link>
        </p>
      </div>
    </div>
  );
}
