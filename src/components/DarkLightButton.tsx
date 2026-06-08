/**
 * FileName: DarkLightButton.tsx
 * Description: Renders a pill-shaped toggle switch for switching between dark and light themes,
 *              showing sun/moon icons with state persistence via localStorage.
 * Authors: Debug Studio
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Redesigned toggle as a pill switch with sun/moon icons and smooth 500ms transition.
 */

import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
  className?: string;
  classNameText?: string;
}

export default function DarkModeButton({ className = "" }: Props) {
  const [isDark, setIsDark] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  const handleToggle = () => {
    const next = !isDark;
    document.documentElement.classList.add("theme-transitioning");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 500);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={handleToggle}
      aria-label={isDark ? t("theme.dark") : t("theme.light")}
      title={isDark ? t("theme.dark") : t("theme.light")}
      className={`relative flex items-center h-7 w-12 rounded-full p-0.5 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 hover:brightness-125 hover:scale-105 ${className}`}
      style={{
        background: isDark
          ? "rgba(77, 154, 255, 0.45)"
          : "rgba(255, 255, 255, 0.25)",
      }}
    >
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-500"
        style={{ transform: isDark ? "translateX(20px)" : "translateX(0px)" }}
      >
        {isDark ? (
          <FiMoon size={13} style={{ color: "#003580" }} />
        ) : (
          <FiSun size={13} style={{ color: "#f59e0b" }} />
        )}
      </span>
    </button>
  );
}
