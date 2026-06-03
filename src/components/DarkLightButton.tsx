/**
 * FileName: DarkLightButton.tsx
 * Description: Renders a toggle switch for switching between dark and light themes, with state persistence using localStorage.
 * Authors: Debug Studio
 * Last Modification made:
 * 03/06/2026 [Nicolas Quintana] Added documentation for maintainability and the DarkModeButton component and its functions.
 */

import Switch from "./ui/Switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  className?: string;
  classNameText?: string;
}

/**
 * FunctionName: DarkModeButton, renders a toggle switch for switching between dark and light themes.
 * Input:
 * - className (string): Additional CSS classes for the container.
 * - classNameText (string): Additional CSS classes for the text label.
 * Output: JSX.Element - The dark mode toggle button component.
 */
export default function DarkModeButton({ className = "", classNameText = ""}: Props) {
  const [isDark, setIsDark] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const darkEnabled = savedTheme === "dark";

    document.documentElement.classList.toggle("dark", darkEnabled);
    setIsDark(darkEnabled);
  }, []);

  const handleThemeChange = (value: boolean) => {
    document.documentElement.classList.toggle("dark", value);
    localStorage.setItem("theme", value ? "dark" : "light");
    setIsDark(value);
  };

  return (
    <div className={`flex flex-col gap-1 w-[5rem] items-center ${className}`}>
      <span className={`whitespace-nowrap ${classNameText || "text-[var(--color-page-text)]"}`} style={{fontSize: '13px', fontWeight: 'bold'}}>{isDark ? t('theme.dark') : t('theme.light')}</span>
      <Switch
      checked={isDark}
      onChange={handleThemeChange}
      srLabel="Cambiar modo oscuro"
      className={`bg-gray-300 data-[checked]:bg-[#0a2cc0]`}
      />
    </div>
  );
}