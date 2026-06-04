/**
 * Login.tsx
 * Description: Login page component that authenticates a user via the backend API and redirects to the dashboard on success. Displays toast notifications for validation and authentication errors.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 02/06/2026 [Nicolas Quintana] Removed comment redundancies.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apiService";
import { ToastContainer, toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import DarkModeButton from "../components/DarkLightButton";

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
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    const next = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(next);
    localStorage.setItem("language", next);
  };
  const [user, setUser] = useState<User>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * handleSubmit, validates input fields and performs login request to the API.
   * Input:
   * - event (React.FormEvent<HTMLFormElement>): Form submit event.
   * Output: Promise<void> - Navigates on success, shows toast messages on validation or request errors.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user.email || !user.password) {
      toast.error(t("toast.fillAllFields"), {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    setLoading(true);
    // Send request to API
    try {
      const result = await postRequest("/login", { ...user });
      if (result.status) {
        navigate("/dashboard");
      } else {
        console.log(result);
        toast.error(t("toast.incorrectCredentials"), {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(t("toast.loginError"), {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleChange, updates form state when the user types in an input field.
   * Input:
   * - event (React.ChangeEvent<HTMLInputElement>): Change event from an input element.
   * Output: void - Updates the "user" state with the new field value.
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [event.target.name]: event.target.value });
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
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          transition: border-color 0.25s ease;
        }
        .field:focus-within {
          border-bottom-color: #001d3d;
        }
        .field input {
          background: transparent;
          color: var(--color-page-text, #001d3d);
          outline: none;
          width: 100%;
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

      <ToastContainer toastClassName="custom-toast" />

      {/* Top-left brand */}
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

      {/* Top-right controls: dark mode + language */}
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
            {t("login.welcome", "Bienvenido")}
          </span>
          <h1
            className="text-[var(--color-page-text-title)] text-[2.5rem] leading-[1.05]"
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {t("login.title")}
          </h1>
          <p className="text-gray-500 text-sm mt-3">
            {t("login.subtitle", "Accede a tu panel de viajes corporativos")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* Email */}
          <div>
            <label
              className="block text-[0.7rem] tracking-[0.2em] uppercase text-gray-500 mb-2"
              style={{ fontWeight: 600 }}
            >
              {t("login.email")}
            </label>
            <div className="field py-2">
              <input
                onChange={handleChange}
                name="email"
                type="email"
                required
                placeholder={t("login.emailPlaceholder")}
                autoComplete="email"
                className="text-[0.95rem]"
                value={user.email}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-[0.7rem] tracking-[0.2em] uppercase text-gray-500"
                style={{ fontWeight: 600 }}
              >
                {t("login.password")}
              </label>
              <a
                href="/recuperar-contrasena"
                className="link-underline text-[0.7rem] tracking-[0.1em] text-[#0466cb]"
                style={{ fontWeight: 500 }}
              >
                {t("login.forgotPassword")}
              </a>
            </div>
            <div className="field py-2 relative">
              <input
                onChange={handleChange}
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="text-[0.95rem] pr-8"
                value={user.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#001d3d] transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <FiEyeOff style={{ width: 18, height: 18 }} />
                ) : (
                  <FiEye style={{ width: 18, height: 18 }} />
                )}
              </button>
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
                <span>{t("login.verifying", "Verificando")}</span>
              </>
            ) : (
              <>
                <span>{t("login.continue")}</span>
                <FiArrowRight style={{ width: 16, height: 16 }} />
              </>
            )}
          </button>
        </form>

        {/* <p className="text-center text-gray-400 text-xs mt-8">
          {t("login.noAccount", "¿Aún no tienes cuenta?")}{" "}
          <a
            href="/register"
            className="link-underline text-[var(--color-page-text-title)]"
            style={{ fontWeight: 600 }}
          >
            {t("login.createOne", "Crea una aquí")}
          </a>
        </p> */}
      </div>
    </div>
  );
}
