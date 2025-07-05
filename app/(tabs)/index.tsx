"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { CreditCard, FileText, TrendingUp, Calendar, DollarSign, CheckCircle } from "lucide-react-native"
import { router } from "expo-router"

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth() // Ahora usando isAuthenticated
  const { theme } = useTheme()

  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const quickActions = [
    {
      title: "Add Expense",
      icon: DollarSign,
      color: "#EF4444",
      onPress: () => router.push("/finances/expenses"),
    },
    {
      title: "Create Task",
      icon: CheckCircle,
      color: "#10B981",
      onPress: () => router.push("/tasks/create"),
    },
    {
      title: "View Calendar",
      icon: Calendar,
      color: "#3B82F6",
      onPress: () => router.push("/tasks/calendar"),
    },
    {
      title: "Analytics",
      icon: TrendingUp,
      color: "#8B5CF6",
      onPress: () => router.push("/finances/analytics"),
    },
  ]

  // Si no hay usuario autenticado, mostrar pantalla de bienvenida
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Welcome to Task & Expenses</Text>
            <Text style={styles.subtitle}>Manage your tasks and finances in one place</Text>

            <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Features</Text>

            <View style={styles.featureCard}>
              <FileText size={24} color="#FF6B35" />
              <Text style={styles.featureTitle}>Task Management</Text>
              <Text style={styles.featureDescription}>Organize your tasks with projects and folders</Text>
            </View>

            <View style={styles.featureCard}>
              <CreditCard size={24} color="#FF6B35" />
              <Text style={styles.featureTitle}>Expense Tracking</Text>
              <Text style={styles.featureDescription}>Keep track of your income and expenses</Text>
            </View>

            <View style={styles.featureCard}>
              <TrendingUp size={24} color="#FF6B35" />
              <Text style={styles.featureTitle}>Analytics</Text>
              <Text style={styles.featureDescription}>Visualize your productivity and spending patterns</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  // Usuario autenticado - mostrar dashboard
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, {user?.name}!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickActionCard} onPress={action.onPress}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={24} color="white" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tasks Completed</Text>
              <Text style={styles.summaryValue}>0</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses Today</Text>
              <Text style={styles.summaryValue}>$0</Text>
            </View>
          </View>
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
    welcomeSection: {
      alignItems: "center",
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      marginBottom: 30,
    },
    loginButton: {
      backgroundColor: "#FF6B35",
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 8,
    },
    loginButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    header: {
      marginBottom: 30,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 5,
    },
    date: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 15,
    },
    quickActionsSection: {
      marginBottom: 30,
    },
    quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    quickActionCard: {
      width: "48%",
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    quickActionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    quickActionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      textAlign: "center",
    },
    summarySection: {
      marginBottom: 30,
    },
    summaryCard: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 20,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    summaryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
    },
    summaryLabel: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#FF6B35",
    },
    featuresSection: {
      marginTop: 20,
    },
    featureCard: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 20,
      borderRadius: 12,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    featureTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginTop: 10,
      marginBottom: 5,
    },
    featureDescription: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
      lineHeight: 20,
    },
  })
