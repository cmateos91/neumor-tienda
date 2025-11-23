// src/lib/toggleTheme.ts
export function toggleTheme(isDark: boolean) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (isDark) {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}
