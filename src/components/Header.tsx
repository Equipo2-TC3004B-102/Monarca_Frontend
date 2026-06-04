/**
 * FileName: Header.tsx
 * Description: Renders the top navigation bar including the application brand, user initials button,
 *              and a dropdown with user info and logout option.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 16/04/2026 [Rebeca-Davila] Added a button with a toggle function to make the sidebar appear
 */

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/auth/authContext";
import { useTranslation } from "react-i18next";
import { FiMenu, FiLogOut, FiMail, FiShield } from "react-icons/fi";
import DarkModeButton from "../components/DarkLightButton";

/**
 * FunctionName: Header, renders a fixed top navbar with the Monarca brand and a user dropdown menu.
 * Input: none (reads auth state via useAuth hook)
 * Output: JSX nav element containing the brand name and user profile dropdown.
 */
function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { handleLogout, authState } = useAuth();
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const next = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(next);
    localStorage.setItem("language", next);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const initials =
    (authState?.userName?.[0] || "") + (authState?.userLastName?.[0] || "");

  return (
    <nav
      className="relative z-50 w-full"
      style={{
        fontFamily: "Montserrat, sans-serif",
        background:
          "linear-gradient(135deg, #001d3d 0%, #00296b 60%, #003580 100%)",
        borderBottom: "1px solid rgba(77, 154, 255, 0.18)",
      }}
    >
      <div className="px-5 lg:px-8 h-[68px] flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          <FiMenu size={22} />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 ml-6 mt-2">
          <span
            className="text-white text-xl tracking-[0.3em]"
            style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 600 }}
          >
            <span style={{ color: "#4d9aff" }}>M</span>ONARCA
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          <DarkModeButton
            className="hidden md:flex md:items-center -mt-1"
            classNameText="#f9fafb"
          ></DarkModeButton>

          {/* Language switch */}
          <button
            type="button"
            title={i18n.language === "es" ? "Switch to English" : "Cambiar a Español"}
            onClick={toggleLanguage}
            className="hidden md:block hover:scale-110 transition-transform"
          >
            <img
              src={i18n.language === "es" ? "/assets/flag_es.svg" : "/assets/flag_gb.svg"}
              alt={i18n.language === "es" ? "Español" : "English"}
              className="w-10 h-7 rounded-sm object-cover shadow-sm"
            />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/10 group"
            >
              <span className="hidden md:flex flex-col items-end leading-tight">
                <span
                  className="text-white text-[0.78rem]"
                  style={{ fontWeight: 600 }}
                >
                  {authState?.userName} {authState?.userLastName}
                </span>
                <span
                  className="text-white/50 text-[0.65rem] tracking-[0.15em] uppercase"
                  style={{ fontWeight: 500 }}
                >
                  {authState?.userRole || "Usuario"}
                </span>
              </span>
              <span
                className="flex items-center justify-center w-10 h-10 rounded-full text-white text-[0.85rem] transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #0466cb 0%, #00296b 100%)",
                  boxShadow: "0 4px 12px -4px rgba(4, 102, 203, 0.6)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                {initials.toUpperCase()}
              </span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-3 w-72 rounded-2xl overflow-hidden bg-white border border-gray-200 z-50"
                style={{
                  boxShadow: "0 20px 60px -20px rgba(0, 29, 61, 0.35)",
                  animation: "headerDropFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <style>{`
                  @keyframes headerDropFade {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

                {/* Profile header */}
                <div
                  className="px-5 py-5"
                  style={{
                    background:
                      "linear-gradient(135deg, #001d3d 0%, #00296b 100%)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-12 h-12 rounded-full text-white text-base flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #4d9aff 0%, #0466cb 100%)",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {initials.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-white text-sm truncate"
                        style={{ fontWeight: 600 }}
                      >
                        {authState.userName} {authState.userLastName}
                      </p>
                      <p
                        className="text-[#4d9aff] text-[0.65rem] tracking-[0.25em] uppercase mt-0.5"
                        style={{ fontWeight: 600 }}
                      >
                        {authState.userRole || "Usuario"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info rows */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="truncate">{authState.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <FiShield className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="truncate">{authState.userRole}</span>
                  </div>
                </div>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-sm text-[#001D3D] hover:bg-gray-50 transition-colors group/btn"
                  style={{ fontWeight: 600 }}
                >
                  <FiLogOut
                    className="text-gray-400 group-hover/btn:text-[#0466cb] transition-colors"
                    size={16}
                  />
                  <span>{t("header.logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
