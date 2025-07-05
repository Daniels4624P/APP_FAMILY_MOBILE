"use client"

import type React from "react"
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"

interface AlertProps {
  children: React.ReactNode
  variant?: "default" | "destructive" | "success" | "warning"
  style?: ViewStyle
}

const Alert: React.FC<AlertProps> = ({ children, variant = "default", style }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const getVariantStyle = () => {
    switch (variant) {
      case "destructive":
        return styles.destructive
      case "success":
        return styles.success
      case "warning":
        return styles.warning
      default:
        return styles.default
    }
  }

  const getIcon = () => {
    const iconSize = 20
    const iconColor = getIconColor()

    switch (variant) {
      case "destructive":
        return <AlertCircle size={iconSize} color={iconColor} />
      case "success":
        return <CheckCircle size={iconSize} color={iconColor} />
      case "warning":
        return <AlertTriangle size={iconSize} color={iconColor} />
      default:
        return <Info size={iconSize} color={iconColor} />
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "destructive":
        return "#EF4444"
      case "success":
        return "#10B981"
      case "warning":
        return "#F59E0B"
      default:
        return "#3B82F6"
    }
  }

  return (
    <View style={[styles.container, getVariantStyle(), style]}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      <View style={styles.content}>{children}</View>
    </View>
  )
}

interface AlertTitleProps {
  children: React.ReactNode
  style?: TextStyle
}

const AlertTitle: React.FC<AlertTitleProps> = ({ children, style }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return <Text style={[styles.title, style]}>{children}</Text>
}

interface AlertDescriptionProps {
  children: React.ReactNode
  style?: TextStyle
}

const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, style }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return <Text style={[styles.description, style]}>{children}</Text>
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      marginVertical: 4,
    },
    default: {
      backgroundColor: isDark ? "#1E3A8A" : "#EFF6FF",
      borderColor: isDark ? "#3B82F6" : "#BFDBFE",
    },
    destructive: {
      backgroundColor: isDark ? "#7F1D1D" : "#FEF2F2",
      borderColor: isDark ? "#EF4444" : "#FECACA",
    },
    success: {
      backgroundColor: isDark ? "#064E3B" : "#ECFDF5",
      borderColor: isDark ? "#10B981" : "#BBF7D0",
    },
    warning: {
      backgroundColor: isDark ? "#78350F" : "#FFFBEB",
      borderColor: isDark ? "#F59E0B" : "#FDE68A",
    },
    iconContainer: {
      marginRight: 12,
      marginTop: 2,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: isDark ? "#D1D5DB" : "#6B7280",
      lineHeight: 20,
    },
  })

export { Alert, AlertTitle, AlertDescription }
export type { AlertProps, AlertTitleProps, AlertDescriptionProps }
