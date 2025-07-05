"use client"

import React from "react"

import type { ReactNode } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  Dimensions,
  type ViewStyle,
} from "react-native"
import { useState, useEffect, createContext, useContext } from "react"
import { ChevronDown, Search, Check } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"

const { height: screenHeight } = Dimensions.get("window")

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  placeholder?: string
  disabled?: boolean
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

interface SelectProps {
  children: ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
}

const Select: React.FC<SelectProps> = ({
  children,
  value: controlledValue,
  onValueChange,
  defaultValue = "",
  placeholder = "Select an option...",
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        placeholder,
        disabled,
      }}
    >
      {children}
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  children: ReactNode
  style?: ViewStyle
  error?: boolean
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, style, error = false }) => {
  const { open, setOpen, disabled } = useSelectContext()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return (
    <TouchableOpacity
      style={[
        styles.trigger,
        error && styles.triggerError,
        disabled && styles.triggerDisabled,
        open && styles.triggerOpen,
        style,
      ]}
      onPress={() => !disabled && setOpen(!open)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.triggerContent}>
        {children}
        <ChevronDown
          size={16}
          color={disabled ? (isDark ? "#4B5563" : "#9CA3AF") : isDark ? "#9CA3AF" : "#6B7280"}
          style={[styles.chevron, open && styles.chevronOpen]}
        />
      </View>
    </TouchableOpacity>
  )
}

interface SelectValueProps {
  placeholder?: string
  style?: ViewStyle
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder: customPlaceholder, style }) => {
  const { value, placeholder: contextPlaceholder } = useSelectContext()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const displayPlaceholder = customPlaceholder || contextPlaceholder

  return <Text style={[styles.value, !value && styles.placeholder, style]}>{value || displayPlaceholder}</Text>
}

interface SelectContentProps {
  children: ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  maxHeight?: number
}

const SelectContent: React.FC<SelectContentProps> = ({
  children,
  searchable = false,
  searchPlaceholder = "Search...",
  maxHeight = screenHeight * 0.4,
}) => {
  const { open, setOpen } = useSelectContext()
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
        <View style={styles.content}>
          {searchable && (
            <View style={styles.searchContainer}>
              <Search size={16} color={isDark ? "#9CA3AF" : "#6B7280"} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                autoFocus
              />
            </View>
          )}
          <ScrollView style={[styles.scrollView, { maxHeight }]} showsVerticalScrollIndicator={false}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && searchable && searchQuery) {
                const childText = child.props.children?.toString().toLowerCase() || ""
                if (!childText.includes(searchQuery.toLowerCase())) {
                  return null
                }
              }
              return child
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

interface SelectItemProps {
  children: ReactNode
  value: string
  disabled?: boolean
  style?: ViewStyle
}

const SelectItem: React.FC<SelectItemProps> = ({ children, value: itemValue, disabled = false, style }) => {
  const { value: selectedValue, onValueChange } = useSelectContext()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const isSelected = selectedValue === itemValue

  return (
    <TouchableOpacity
      style={[styles.item, isSelected && styles.itemSelected, disabled && styles.itemDisabled, style]}
      onPress={() => !disabled && onValueChange(itemValue)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.itemText, isSelected && styles.itemTextSelected, disabled && styles.itemTextDisabled]}>
        {children}
      </Text>
      {isSelected && <Check size={16} color="#FF6B35" />}
    </TouchableOpacity>
  )
}

interface SelectSeparatorProps {
  style?: ViewStyle
}

const SelectSeparator: React.FC<SelectSeparatorProps> = ({ style }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return <View style={[styles.separator, style]} />
}

interface SelectLabelProps {
  children: ReactNode
  style?: ViewStyle
}

const SelectLabel: React.FC<SelectLabelProps> = ({ children, style }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return <Text style={[styles.label, style]}>{children}</Text>
}

// Componente simplificado para casos básicos
interface SimpleSelectProps {
  options: Array<{ label: string; value: string; disabled?: boolean }>
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  error?: boolean
  style?: ViewStyle
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchable = false,
  disabled = false,
  error = false,
  style,
}) => {
  return (
    <Select value={value} onValueChange={onValueChange} placeholder={placeholder} disabled={disabled}>
      <SelectTrigger style={style} error={error}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent searchable={searchable}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    trigger: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
      minHeight: 44,
    },
    triggerError: {
      borderColor: "#EF4444",
    },
    triggerDisabled: {
      opacity: 0.5,
      backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
    },
    triggerOpen: {
      borderColor: "#FF6B35",
    },
    triggerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
    chevron: {
      marginLeft: 8,
      transform: [{ rotate: "0deg" }],
    },
    chevronOpen: {
      transform: [{ rotate: "180deg" }],
    },
    value: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      flex: 1,
    },
    placeholder: {
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    content: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      borderRadius: 12,
      width: "100%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#E5E7EB",
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      paddingVertical: 8,
    },
    scrollView: {
      maxHeight: 300,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#F3F4F6",
    },
    itemSelected: {
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
    },
    itemDisabled: {
      opacity: 0.5,
    },
    itemText: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      flex: 1,
    },
    itemTextSelected: {
      color: "#FF6B35",
      fontWeight: "500",
    },
    itemTextDisabled: {
      color: isDark ? "#6B7280" : "#9CA3AF",
    },
    separator: {
      height: 1,
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
      marginVertical: 4,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      paddingHorizontal: 12,
      paddingVertical: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
  })

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator, SelectLabel, SimpleSelect }

export type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectContentProps,
  SelectItemProps,
  SimpleSelectProps,
}
