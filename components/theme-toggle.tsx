"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check system preference or saved preference
    const saved = localStorage.getItem("theme") as "light" | "dark" | null
    const isDark =
      saved === "dark" ||
      (!saved && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    const newTheme = isDark ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
  }, [])

  const applyTheme = (newTheme: "light" | "dark") => {
    const html = document.documentElement
    if (newTheme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    localStorage.setItem("theme", newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Sun className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  )
}
