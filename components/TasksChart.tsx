"use client"

import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import MonthlyTasksChart from "@/components/MonthlyTasksChart"

const TasksChart = () => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Tasks Overview</Text>
        <Text style={styles.subtitle}>Track your productivity over time</Text>
      </View>
      <MonthlyTasksChart />
    </ScrollView>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#191919" : "#F7F6F3",
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 32,
    },
    header: {
      alignItems: "center",
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
    },
  })

export default TasksChart
