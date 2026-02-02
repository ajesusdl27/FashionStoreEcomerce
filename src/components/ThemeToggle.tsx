import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateResolvedTheme = () => {
      const isSystem = theme === "system";
      const resolved = isSystem
        ? mediaQuery.matches
          ? "dark"
          : "light"
        : (theme as "light" | "dark");
      setResolvedTheme(resolved);
      document.documentElement.classList.add("theme-transitioning");
      document.documentElement.classList.toggle("dark", resolved === "dark");
      setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 300);
      if (isSystem) {
        localStorage.removeItem("theme");
      } else {
        localStorage.setItem("theme", theme);
      }
    };
    updateResolvedTheme();
    mediaQuery.addEventListener("change", updateResolvedTheme);
    return () => mediaQuery.removeEventListener("change", updateResolvedTheme);
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        const newTheme = (e.newValue as Theme) || "system";
        setTheme(newTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length] || "system";
    setTheme(nextTheme);
  };

  if (!mounted) {
    return <button className="w-11 h-11" aria-hidden="true" />;
  }

  const Icon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Sun : Moon;
  const label =
    theme === "system"
      ? "Tema: Sistema"
      : `Cambiar a modo ${resolvedTheme === "dark" ? "claro" : "oscuro"}`;

  return (
    <button
      onClick={cycleTheme}
      className="w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background relative group"
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
