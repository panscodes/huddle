"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = stored ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="rounded-full p-2 bg-muted hover:bg-muted/80 transition-all duration-300 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Toggle dark mode"
    >
      <div className="flex items-center justify-center w-5 h-5 relative">
        {theme === "light" ? (
          <>
            <Moon
              className="absolute h-5 w-5 opacity-100 transition-opacity duration-300 ease-in-out"
              aria-hidden="true"
            />
            <Sun
              className="absolute h-5 w-5 opacity-0 transition-opacity duration-300 ease-in-out"
              aria-hidden="true"
            />
          </>
        ) : (
          <>
            <Moon
              className="absolute h-5 w-5 opacity-0 transition-opacity duration-300 ease-in-out"
              aria-hidden="true"
            />
            <Sun
              className="absolute h-5 w-5 opacity-100 transition-opacity duration-300 ease-in-out"
              aria-hidden="true"
            />
          </>
        )}
      </div>
    </button>
  );
}