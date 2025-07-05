"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Colors } from "@/constants/Colors"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  colors: typeof Colors
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "@app_theme"

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light")
  const [isLoading, setIsLoading] = useState(true)

  // Cargar tema guardado al inicializar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        console.log("🎨 [THEME] Loading saved theme...")
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
          console.log("✅ [THEME] Loaded saved theme:", savedTheme)
          setTheme(savedTheme as Theme)
        } else {
          console.log("🎨 [THEME] No saved theme found, using default: light")
        }
      } catch (error) {
        console.error("❌ [THEME] Error loading theme:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    console.log("🎨 [THEME] Switching theme from", theme, "to", newTheme)

    try {
      setTheme(newTheme)
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
      console.log("✅ [THEME] Theme saved successfully:", newTheme)
    } catch (error) {
      console.error("❌ [THEME] Error saving theme:", error)
      // Revertir el cambio si falla el guardado
      setTheme(theme)
    }
  }

  const isDark = theme === "dark"

  const colors = isDark
    ? {
        ...Colors,
        background: {
          primary: "#1a1a1a",
          secondary: "#2d2d2d",
          tertiary: "#404040",
        },
        text: {
          primary: "#ffffff",
          secondary: "#d1d5db",
          tertiary: "#9ca3af",
          inverse: "#1a1a1a",
        },
      }
    : Colors

  // No renderizar hasta que se cargue el tema
  if (isLoading) {
    return null // o un loading spinner si prefieres
  }

  return <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
