"use client"

import type React from "react"
import { Text, StyleSheet, type TextProps } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"

interface LabelProps extends TextProps {
  children: React.ReactNode
  variant?: "default" | "destructive" | "muted" | "accent"
  size?: "sm" | "default" | "lg"
  required?: boolean
  htmlFor?: string // Para compatibilidad con web, aunque no se usa en RN
}

const Label: React.FC<LabelProps> = ({
  children,
  variant = "default",
  size = "default",
  required = false,
  style,
  ...props
}) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const getVariantStyle = () => {
    switch (variant) {
      case "destructive":
        return styles.destructive
      case "muted":
        return styles.muted
      case "accent":
        return styles.accent
      default:
        return styles.default
    }
  }

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sm
      case "lg":
        return styles.lg
      default:
        return styles.defaultSize
    }
  }

  return (
    <Text style={[styles.base, getVariantStyle(), getSizeStyle(), style]} {...props}>
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    base: {
      fontWeight: "500",
      lineHeight: 16,
      marginBottom: 4,
    },
    default: {
      color: isDark ? "#FFFFFF" : "#0F172A",
    },
    destructive: {
      color: "#EF4444",
    },
    muted: {
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    accent: {
      color: "#FF6B35",
    },
    sm: {
      fontSize: 12,
      lineHeight: 14,
    },
    defaultSize: {
      fontSize: 14,
      lineHeight: 16,
    },
    lg: {
      fontSize: 16,
      lineHeight: 18,
    },
    required: {
      color: "#EF4444",
      fontWeight: "600",
    },
  })

export { Label }
export type { LabelProps }
