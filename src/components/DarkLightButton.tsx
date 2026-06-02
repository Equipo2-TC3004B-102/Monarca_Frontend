import Switch from "./ui/Switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  className?: string;
  classNameText?: string;
}

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
      <span className="whitespace-nowrap" style={{fontSize: '13px', fontWeight: 'bold', color: classNameText || '#ffffff'}}>{isDark ? t('theme.dark') : t('theme.light')}</span>
      <Switch
      checked={isDark}
      onChange={handleThemeChange}
      srLabel="Cambiar modo oscuro"
      className={`bg-gray-300 data-[checked]:bg-[#0a2cc0]`}
      />
    </div>
  );
}