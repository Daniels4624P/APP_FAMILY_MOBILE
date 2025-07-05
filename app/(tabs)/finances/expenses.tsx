"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { Pencil, Trash2, Plus, X, Calendar } from "lucide-react-native"
import { getExpenses, createExpense, updateExpense, deleteExpense, getCategories, getAccounts } from "@/utils/api"
import { formatNumber, unformatNumber, formatNumberWithCurrency } from "@/utils/numberFormat"
import { Label } from "@/components/ui/Label"
import { FormField } from "@/components/ui/FormField"
import { SimpleSelect } from "@/components/ui/Select"
import Loader from "@/components/Loader"

interface Expense {
  id: number
  description: string
  valor: number
  categoriaId: number
  cuentaId: number
  destinoId?: number
  fecha: string
  category?: { name: string }
  accountInicio?: { name: string }
  accountDestino?: { name: string }
}

interface Category {
  id: number
  name: string
}

interface Account {
  id: number
  name: string
  public: boolean
  isPublic?: boolean
}

export default function ExpensesScreen() {
  const { theme } = useTheme()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSelectedAccountPublic, setIsSelectedAccountPublic] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    valor: "",
    categoriaId: "",
    cuentaId: "",
    destinoId: "",
    fecha: new Date().toISOString().split("T")[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expensesData, categoriesData, accountsData] = await Promise.all([
        getExpenses(),
        getCategories(),
        getAccounts(),
      ])

      setExpenses(expensesData.data)
      setCategories(categoriesData.data)
      setAccounts(
        accountsData.data.map((account: Account) => ({
          ...account,
          isPublic: account.public,
        })),
      )
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Error", "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.valor.trim()) {
      newErrors.valor = "Amount is required"
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = "Category is required"
    }

    if (!formData.cuentaId) {
      newErrors.cuentaId = "Source account is required"
    }

    if (!formData.fecha) {
      newErrors.fecha = "Date is required"
    }

    if (isSelectedAccountPublic && !formData.destinoId) {
      newErrors.destinoId = "Destination account is required for public accounts"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const formattedData = {
      ...formData,
      valor: Number(unformatNumber(formData.valor)),
      fecha: new Date(formData.fecha).toISOString(),
      destinoId: formData.destinoId || null,
      categoriaId: Number.parseInt(formData.categoriaId),
      cuentaId: Number.parseInt(formData.cuentaId),
    }

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, formattedData)
        Alert.alert("Success", "Expense updated successfully")
      } else {
        await createExpense(formattedData)
        Alert.alert("Success", "Expense created successfully")
      }

      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving expense:", error)
      Alert.alert("Error", "Failed to save expense")
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      valor: formatNumber(expense.valor),
      categoriaId: expense.categoriaId.toString(),
      cuentaId: expense.cuentaId.toString(),
      destinoId: expense.destinoId?.toString() || "",
      fecha: expense.fecha.split("T")[0],
    })

    const selectedAccount = accounts.find((account) => account.id === expense.cuentaId)
    setIsSelectedAccountPublic(selectedAccount ? selectedAccount.isPublic || false : false)

    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpense(id)
            fetchData()
            Alert.alert("Success", "Expense deleted successfully")
          } catch (error) {
            console.error("Error deleting expense:", error)
            Alert.alert("Error", "Failed to delete expense")
          }
        },
      },
    ])
  }

  const resetForm = () => {
    setFormData({
      description: "",
      valor: "",
      categoriaId: "",
      cuentaId: "",
      destinoId: "",
      fecha: new Date().toISOString().split("T")[0],
    })
    setEditingExpense(null)
    setShowForm(false)
    setErrors({})
    setIsSelectedAccountPublic(false)
  }

  const handleSourceAccountChange = (accountId: string) => {
    setFormData({ ...formData, cuentaId: accountId, destinoId: "" })
    const selectedAccount = accounts.find((account) => account.id === Number.parseInt(accountId))
    setIsSelectedAccountPublic(selectedAccount ? selectedAccount.isPublic || false : false)
  }

  const handleValorChange = (value: string) => {
    const formatted = formatNumber(value)
    setFormData({ ...formData, valor: formatted })
  }

  // Preparar opciones para los selects
  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id.toString(),
  }))

  const accountOptions = accounts.map((account) => ({
    label: account.name,
    value: account.id.toString(),
  }))

  if (isLoading) {
    return <Loader size="large" text="Loading expenses..." />
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{editingExpense ? "Edit Expense" : "Create Expense"}</Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={24} color={isDark ? "#FFFFFF" : "#000000"} />
              </TouchableOpacity>
            </View>

            <FormField label="Description" required error={errors.description}>
              <TextInput
                style={[styles.input, errors.description && styles.inputError]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter description"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            </FormField>

            <FormField label="Amount" required error={errors.valor} description="Enter amount in Colombian pesos (COP)">
              <TextInput
                style={[styles.input, errors.valor && styles.inputError]}
                value={formData.valor}
                onChangeText={handleValorChange}
                placeholder="Enter amount"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                keyboardType="numeric"
              />
            </FormField>

            <FormField label="Category" required error={errors.categoriaId}>
              <SimpleSelect
                options={categoryOptions}
                value={formData.categoriaId}
                onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
                placeholder="Select a category"
                searchable
                error={!!errors.categoriaId}
              />
            </FormField>

            <FormField label="Source Account" required error={errors.cuentaId}>
              <SimpleSelect
                options={accountOptions}
                value={formData.cuentaId}
                onValueChange={handleSourceAccountChange}
                placeholder="Select source account"
                searchable
                error={!!errors.cuentaId}
              />
            </FormField>

            {isSelectedAccountPublic && (
              <FormField
                label="Destination Account"
                required
                error={errors.destinoId}
                description="Required for public accounts"
              >
                <SimpleSelect
                  options={accountOptions}
                  value={formData.destinoId}
                  onValueChange={(value) => setFormData({ ...formData, destinoId: value })}
                  placeholder="Select destination account"
                  searchable
                  error={!!errors.destinoId}
                />
              </FormField>
            )}

            <FormField label="Date" required error={errors.fecha}>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <TextInput
                  style={[styles.dateInput, errors.fecha && styles.inputError]}
                  value={formData.fecha}
                  onChangeText={(text) => setFormData({ ...formData, fecha: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </View>
            </FormField>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{editingExpense ? "Update Expense" : "Create Expense"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.expensesList}>
          <Label size="lg" style={styles.sectionTitle}>
            Expenses List
          </Label>
          {expenses.length === 0 ? (
            <Label variant="muted" style={styles.emptyText}>
              No expenses found.
            </Label>
          ) : (
            expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  <Label variant="muted" size="sm">
                    Category: {expense.category?.name || "N/A"}
                  </Label>
                  <Label variant="muted" size="sm">
                    Source Account: {expense.accountInicio?.name || "N/A"}
                  </Label>
                  {expense.accountDestino && (
                    <Label variant="muted" size="sm">
                      Destination Account: {expense.accountDestino.name}
                    </Label>
                  )}
                  <Label variant="accent" size="sm">
                    Amount: {formatNumberWithCurrency(expense.valor)}
                  </Label>
                  <Label variant="muted" size="sm">
                    Date: {expense.fecha.split("T")[0].split("-").reverse().join("/")}
                  </Label>
                </View>
                <View style={styles.expenseActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(expense)}>
                    <Pencil size={16} color="#FF6B35" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(expense.id)}>
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
    dateInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#D1D5DB",
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
    },
    dateInput: {
      flex: 1,
      paddingVertical: 10,
      paddingLeft: 10,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
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
    expensesList: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
    },
    emptyText: {
      textAlign: "center",
      fontStyle: "italic",
      marginTop: 20,
    },
    expenseCard: {
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
    expenseInfo: {
      flex: 1,
      gap: 2,
    },
    expenseDescription: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 5,
    },
    expenseActions: {
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
