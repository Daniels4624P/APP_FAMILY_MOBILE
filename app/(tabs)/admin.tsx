"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Users, TrendingUp, Shield, BarChart3 } from "lucide-react-native"
import { router } from "expo-router"
import { getUser, getUsersPoints } from "@/utils/api"
import Loader from "@/components/Loader"

export default function AdminScreen() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [users, setUsers] = useState<any[]>([])
  const [userPoints, setUserPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchAdminData()
    } else if (user && !user.isAdmin) {
      setLoading(false)
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch users and user points
      const [userData, pointsData] = await Promise.all([
        getUser(user!.id), // For now, just get current user
        getUsersPoints(),
      ])

      setUsers([userData.data])
      setUserPoints(pointsData.data)
    } catch (err: any) {
      console.error("Error fetching admin data:", err)
      setError("Failed to load admin data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Verificar si el usuario no está autenticado o no es admin
  if (!user || !user.isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Shield size={48} color="#EF4444" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            {!user ? "Please log in to access this page" : "Admin privileges required"}
          </Text>
          {!user && (
            <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  if (loading) {
    return <Loader size="large" text="Loading admin data..." />
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAdminData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const adminOptions = [
    {
      title: "User Management",
      description: "Manage system users",
      icon: Users,
      color: "#3B82F6",
      onPress: () => {
        // Show users list
        Alert.alert("Users", `Total users: ${users.length}`)
      },
    },
    {
      title: "User Points",
      description: "View user points and rankings",
      icon: TrendingUp,
      color: "#10B981",
      onPress: () => {
        // Show user points
        Alert.alert("User Points", `Total users with points: ${userPoints.length}`)
      },
    },
    {
      title: "System Analytics",
      description: "View system statistics",
      icon: BarChart3,
      color: "#8B5CF6",
      onPress: () => {
        Alert.alert("Analytics", "System analytics coming soon")
      },
    },
  ]

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>System administration and management</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.optionsGrid}>
            {adminOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionCard} onPress={option.onPress}>
                <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                  <option.icon size={24} color="white" />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Users</Text>
          <View style={styles.card}>
            {users.length > 0 ? (
              users.map((userData) => (
                <View key={userData.id} style={styles.userItem}>
                  <Text style={styles.userLabel}>Name:</Text>
                  <Text style={styles.userValue}>{userData.name}</Text>
                  <Text style={styles.userLabel}>Email:</Text>
                  <Text style={styles.userValue}>{userData.email}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No users found</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Points Ranking</Text>
          <View style={styles.card}>
            {userPoints.length > 0 ? (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Name</Text>
                  <Text style={styles.tableHeaderText}>Points</Text>
                </View>
                {userPoints.map((userPoint, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{userPoint.name}</Text>
                    <Text style={[styles.tableCell, styles.pointsCell]}>{userPoint.points}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No user points data available</Text>
            )}
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
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 15,
    },
    optionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    optionCard: {
      width: "48%",
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
    optionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 5,
    },
    optionDescription: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
      lineHeight: 16,
    },
    card: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 20,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    userItem: {
      marginBottom: 15,
    },
    userLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 2,
    },
    userValue: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 8,
    },
    table: {
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#E5E7EB",
      borderRadius: 8,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    tableHeaderText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      textAlign: "center",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
    },
    tableCell: {
      flex: 1,
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#000000",
      textAlign: "center",
    },
    pointsCell: {
      fontWeight: "600",
      color: "#FF6B35",
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      fontStyle: "italic",
    },
    accessDeniedContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    accessDeniedTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#EF4444",
      marginTop: 20,
      marginBottom: 10,
    },
    accessDeniedText: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: "#FF6B35",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    errorText: {
      fontSize: 16,
      color: "#EF4444",
      textAlign: "center",
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: "#FF6B35",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  })
