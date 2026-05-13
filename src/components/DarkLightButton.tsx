import Switch from "./ui/Switch";
import { useEffect, useState } from "react";

interface Props {
  className?: string;
  classNameText?: string;
}

export default function DarkModeButton({ className = "", classNameText = ""}: Props) {
  const [isDark, setIsDark] = useState(false);

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
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className={`${classNameText || "text-[var(--color-page-text)]"}`} style={{fontSize: '13px', fontWeight: 'bold'}}>{isDark ? "Modo oscuro" : "Modo claro"}</span>
      <Switch 
      checked={isDark}
      onChange={handleThemeChange}
      srLabel="Cambiar modo oscuro"
      className={`bg-gray-300 data-[checked]:bg-[var(--light-blue)]`}
      />
    </div>
  );
}