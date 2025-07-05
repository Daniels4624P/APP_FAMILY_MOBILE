"use client"

import type React from "react"
import { TextInput, StyleSheet, type TextInputProps, type ViewStyle } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"

interface TextareaProps extends Omit<TextInputProps, "style"> {
  style?: ViewStyle
  error?: boolean
  rows?: number
}

const Textarea: React.FC<TextareaProps> = ({ style, error = false, rows = 4, ...props }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const minHeight = rows * 20 + 20 // Aproximadamente 20px por línea + padding

  return (
    <TextInput
      style={[styles.textarea, error && styles.textareaError, { minHeight }, style]}
      multiline
      textAlignVertical="top"
      {...props}
    />
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    textarea: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
      textAlignVertical: "top",
    },
    textareaError: {
      borderColor: "#EF4444",
    },
  })

export { Textarea }
export type { TextareaProps }
