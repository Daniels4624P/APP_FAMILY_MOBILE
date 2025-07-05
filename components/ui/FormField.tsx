"use client"

import type React from "react"
import { View, StyleSheet } from "react-native"
import { Label } from "./Label"
import { useTheme } from "@/contexts/ThemeContext"

interface FormFieldProps {
  children: React.ReactNode
  label?: string
  labelVariant?: "default" | "destructive" | "muted" | "accent"
  labelSize?: "sm" | "default" | "lg"
  required?: boolean
  error?: string
  description?: string
  spacing?: "sm" | "default" | "lg"
}

const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  labelVariant = "default",
  labelSize = "default",
  required = false,
  error,
  description,
  spacing = "default",
}) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const getSpacingStyle = () => {
    switch (spacing) {
      case "sm":
        return styles.spacingSm
      case "lg":
        return styles.spacingLg
      default:
        return styles.spacingDefault
    }
  }

  return (
    <View style={[styles.container, getSpacingStyle()]}>
      {label && (
        <Label variant={error ? "destructive" : labelVariant} size={labelSize} required={required}>
          {label}
        </Label>
      )}

      {children}

      {description && !error && (
        <Label variant="muted" size="sm" style={styles.description}>
          {description}
        </Label>
      )}

      {error && (
        <Label variant="destructive" size="sm" style={styles.error}>
          {error}
        </Label>
      )}
    </View>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    spacingSm: {
      marginBottom: 12,
    },
    spacingDefault: {
      marginBottom: 16,
    },
    spacingLg: {
      marginBottom: 20,
    },
    description: {
      marginTop: 4,
    },
    error: {
      marginTop: 4,
    },
  })

export { FormField }
export type { FormFieldProps }
