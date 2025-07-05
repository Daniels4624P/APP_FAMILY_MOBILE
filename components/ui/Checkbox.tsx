"use client"

import type React from "react"
import { TouchableOpacity, View, Text, StyleSheet, type ViewStyle } from "react-native"
import { Check } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  style?: ViewStyle
  size?: "sm" | "default" | "lg"
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  label,
  style,
  size = "default",
}) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sm
      case "lg":
        return styles.lg
      default:
        return styles.default
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 12
      case "lg":
        return 20
      default:
        return 16
    }
  }

  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress} disabled={disabled} activeOpacity={0.7}>
      <View
        style={[
          styles.checkbox,
          getSizeStyle(),
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {checked && <Check size={getIconSize()} color="#FFFFFF" />}
      </View>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
    </TouchableOpacity>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkbox: {
      borderWidth: 2,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 4,
      backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      backgroundColor: "#FF6B35",
      borderColor: "#FF6B35",
    },
    checkboxDisabled: {
      opacity: 0.5,
    },
    sm: {
      width: 16,
      height: 16,
    },
    default: {
      width: 20,
      height: 20,
    },
    lg: {
      width: 24,
      height: 24,
    },
    label: {
      marginLeft: 8,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
    },
    labelDisabled: {
      opacity: 0.5,
    },
  })

export { Checkbox }
export type { CheckboxProps }
