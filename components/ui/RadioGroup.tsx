"use client"

import React from "react"

import type { ReactNode } from "react"
import { View, TouchableOpacity, Text, StyleSheet, type ViewStyle } from "react-native"
import { createContext, useContext } from "react"
import { useTheme } from "@/contexts/ThemeContext"

interface RadioGroupContextType {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined)

const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext)
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup")
  }
  return context
}

interface RadioGroupProps {
  children: ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  style?: ViewStyle
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  value: controlledValue,
  onValueChange,
  defaultValue = "",
  disabled = false,
  style,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <RadioGroupContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        disabled,
      }}
    >
      <View style={style}>{children}</View>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps {
  value: string
  id?: string
  disabled?: boolean
  style?: ViewStyle
  size?: "sm" | "default" | "lg"
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value: itemValue,
  disabled: itemDisabled = false,
  style,
  size = "default",
}) => {
  const { value: selectedValue, onValueChange, disabled: groupDisabled } = useRadioGroupContext()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const isSelected = selectedValue === itemValue
  const isDisabled = groupDisabled || itemDisabled

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

  const handlePress = () => {
    if (!isDisabled) {
      onValueChange(itemValue)
    }
  }

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress} disabled={isDisabled} activeOpacity={0.7}>
      <View
        style={[styles.radio, getSizeStyle(), isSelected && styles.radioSelected, isDisabled && styles.radioDisabled]}
      >
        {isSelected && (
          <View
            style={[
              styles.radioInner,
              size === "sm" ? styles.radioInnerSm : size === "lg" ? styles.radioInnerLg : styles.radioInnerDefault,
            ]}
          />
        )}
      </View>
    </TouchableOpacity>
  )
}

interface RadioGroupLabelProps {
  children: ReactNode
  htmlFor?: string
  style?: ViewStyle
}

const RadioGroupLabel: React.FC<RadioGroupLabelProps> = ({ children, style }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return <Text style={[styles.label, style]}>{children}</Text>
}

// Componente combinado para facilitar el uso
interface RadioGroupOptionProps {
  value: string
  label: string
  disabled?: boolean
  style?: ViewStyle
  size?: "sm" | "default" | "lg"
}

const RadioGroupOption: React.FC<RadioGroupOptionProps> = ({
  value,
  label,
  disabled = false,
  style,
  size = "default",
}) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return (
    <View style={[styles.option, style]}>
      <RadioGroupItem value={value} disabled={disabled} size={size} />
      <RadioGroupLabel style={[styles.optionLabel, disabled && styles.optionLabelDisabled]}>{label}</RadioGroupLabel>
    </View>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    radio: {
      borderWidth: 2,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 50,
      backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
    },
    radioSelected: {
      borderColor: "#FF6B35",
    },
    radioDisabled: {
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
    radioInner: {
      backgroundColor: "#FF6B35",
      borderRadius: 50,
    },
    radioInnerSm: {
      width: 8,
      height: 8,
    },
    radioInnerDefault: {
      width: 10,
      height: 10,
    },
    radioInnerLg: {
      width: 12,
      height: 12,
    },
    label: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      marginLeft: 8,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    optionLabel: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      marginLeft: 8,
    },
    optionLabelDisabled: {
      opacity: 0.5,
    },
  })

export { RadioGroup, RadioGroupItem, RadioGroupLabel, RadioGroupOption }
export type { RadioGroupProps, RadioGroupItemProps, RadioGroupLabelProps, RadioGroupOptionProps }
