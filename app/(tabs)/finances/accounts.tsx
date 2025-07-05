"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { Pencil, Trash2, Plus, X } from "lucide-react-native"
import { getAccounts, createAccount, updateAccount, deleteAccount } from "@/utils/api"
import { formatNumber, unformatNumber, formatNumberWithCurrency } from "@/utils/numberFormat"
import Loader from "@/components/Loader"

interface Account {
  id: number
  name: string
  tipo: string
  saldo: number
  public: boolean
  createdAt?: string
}

export default function AccountsScreen() {
  const { theme } = useTheme()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    tipo: "",
    saldo: "",
    public: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts()
      setAccounts(response.data)
    } catch (error) {
      console.error("Error fetching accounts:", error)
      Alert.alert("Error", "Failed to load accounts")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Account name is required"
    }

    if (!formData.tipo) {
      newErrors.tipo = "Account type is required"
    }

    if (!formData.saldo.trim()) {
      newErrors.saldo = "Initial balance is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const formattedData = {
      ...formData,
      saldo: unformatNumber(formData.saldo),
      public: formData.public,
    }

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formattedData)
        Alert.alert("Success", "Account updated successfully")
      } else {
        await createAccount(formattedData)
        Alert.alert("Success", "Account created successfully")
      }

      resetForm()
      fetchAccounts()
    } catch (error) {
      console.error("Error saving account:", error)
      Alert.alert("Error", "Failed to save account")
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      tipo: account.tipo,
      saldo: account.saldo ? account.saldo.toString() : "",
      public: account.public,
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    Alert.alert("Delete Account", "Are you sure you want to delete this account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccount(id)
            fetchAccounts()
            Alert.alert("Success", "Account deleted successfully")
          } catch (error) {
            console.error("Error deleting account:", error)
            Alert.alert("Error", "Failed to delete account")
          }
        },
      },
    ])
  }

  const resetForm = () => {
    setFormData({
      name: "",
      tipo: "",
      saldo: "",
      public: false,
    })
    setEditingAccount(null)
    setShowForm(false)
    setErrors({})
  }

  const handleSaldoChange = (value: string) => {
    const formatted = formatNumber(value)
    setFormData({ ...formData, saldo: formatted })
  }

  if (isLoading) {
    return <Loader size="large" text="Loading accounts..." />
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Accounts</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Account</Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{editingAccount ? "Edit Account" : "Create Account"}</Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={24} color={isDark ? "#FFFFFF" : "#000000"} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Account Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter account name"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.pickerContainer}>
                {["", "Ahorros", "Corriente", "Credito"].map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[styles.pickerOption, formData.tipo === tipo && styles.pickerOptionSelected]}
                    onPress={() => setFormData({ ...formData, tipo })}
                  >
                    <Text style={[styles.pickerOptionText, formData.tipo === tipo && styles.pickerOptionTextSelected]}>
                      {tipo || "Select type"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.tipo && <Text style={styles.errorText}>{errors.tipo}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Initial Balance</Text>
              <TextInput
                style={[styles.input, errors.saldo && styles.inputError]}
                value={formData.saldo}
                onChangeText={handleSaldoChange}
                placeholder="Enter initial balance"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                keyboardType="numeric"
              />
              {errors.saldo && <Text style={styles.errorText}>{errors.saldo}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Public Account</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[styles.switchOption, !formData.public && styles.switchOptionSelected]}
                  onPress={() => setFormData({ ...formData, public: false })}
                >
                  <Text style={[styles.switchOptionText, !formData.public && styles.switchOptionTextSelected]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.switchOption, formData.public && styles.switchOptionSelected]}
                  onPress={() => setFormData({ ...formData, public: true })}
                >
                  <Text style={[styles.switchOptionText, formData.public && styles.switchOptionTextSelected]}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{editingAccount ? "Update Account" : "Create Account"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.accountsList}>
          <Text style={styles.sectionTitle}>Accounts List</Text>
          {accounts.length === 0 ? (
            <Text style={styles.emptyText}>No accounts found.</Text>
          ) : (
            accounts.map((account) => (
              <View key={account.id} style={styles.accountCard}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountDetail}>Type: {account.tipo}</Text>
                  <Text style={styles.accountBalance}>
                    Balance: {formatNumberWithCurrency(account.saldo.toString())}
                  </Text>
                  <Text style={styles.accountDetail}>Public: {account.public ? "Yes" : "No"}</Text>
                  {account.createdAt && (
                    <Text style={styles.accountDetail}>
                      Created: {account.createdAt.split("T")[0].split("-").reverse().join("/")}
                    </Text>
                  )}
                </View>
                <View style={styles.accountActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(account)}>
                    <Pencil size={16} color="#FF6B35" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(account.id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#191919" : "#F7F6F3",
    },
    scrollContent: {
      padding: 20,
      paddingTop: 60,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FF6B35",
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 8,
    },
    addButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 5,
    },
    formContainer: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    formHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
    },
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
    },
    inputError: {
      borderColor: "#EF4444",
    },
    errorText: {
      fontSize: 12,
      color: "#EF4444",
      marginTop: 5,
    },
    pickerContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    pickerOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
    },
    pickerOptionSelected: {
      backgroundColor: "#FF6B35",
      borderColor: "#FF6B35",
    },
    pickerOptionText: {
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#000000",
    },
    pickerOptionTextSelected: {
      color: "#FFFFFF",
    },
    switchContainer: {
      flexDirection: "row",
      gap: 8,
    },
    switchOption: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
    },
    switchOptionSelected: {
      backgroundColor: "#FF6B35",
      borderColor: "#FF6B35",
    },
    switchOptionText: {
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#000000",
    },
    switchOptionTextSelected: {
      color: "#FFFFFF",
    },
    formActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 20,
    },
    cancelButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
    },
    cancelButtonText: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    submitButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: "#FF6B35",
    },
    submitButtonText: {
      fontSize: 14,
      color: "#FFFFFF",
      fontWeight: "600",
    },
    accountsList: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 15,
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      fontStyle: "italic",
      marginTop: 20,
    },
    accountCard: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    accountInfo: {
      flex: 1,
    },
    accountName: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 5,
    },
    accountDetail: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 2,
    },
    accountBalance: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 2,
    },
    accountActions: {
      flexDirection: "row",
      gap: 10,
    },
    editButton: {
      padding: 8,
    },
    deleteButton: {
      padding: 8,
    },
  })
