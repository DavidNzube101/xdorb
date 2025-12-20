export type Theme = "light" | "dark" | "system"

export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: "light" | "dark"
}

// Color tokens for the dashboard
export const colors = {
  light: {
    bg: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
      tertiary: "#9ca3af",
    },
    accent: {
      primary: "#f9961e", // Orange
      secondary: "#116b61", // Teal
    },
    border: "#e5e7eb",
  },
  dark: {
    bg: {
      primary: "#0f0f0f",
      secondary: "#1a1a1a",
      tertiary: "#252525",
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#d1d5db",
      tertiary: "#9ca3af",
    },
    accent: {
      primary: "#f9961e", // Orange (same in both themes)
      secondary: "#116b61", // Teal (same in both themes)
    },
    border: "#2d2d2d",
  },
}

export function getThemeColors(theme: "light" | "dark") {
  return colors[theme]
}
