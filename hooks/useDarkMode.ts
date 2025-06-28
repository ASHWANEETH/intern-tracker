import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.localStorage.getItem("theme") === "dark"
      : false
  );

  useEffect(() => {
    const classList = document.documentElement.classList;
    const dark = localStorage.getItem("theme") === "dark";

    if (dark) classList.add("dark");
    else classList.remove("dark");

    const handleStorageChange = () => {
      const updated = localStorage.getItem("theme") === "dark";
      setIsDark(updated);
      if (updated) classList.add("dark");
      else classList.remove("dark");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleDark = () => {
    const updated = !isDark;
    setIsDark(updated);
    localStorage.setItem("theme", updated ? "dark" : "light");

    if (updated) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  return { isDark, toggleDark };
}
