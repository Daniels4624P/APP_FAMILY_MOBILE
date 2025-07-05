"use client"

import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import MonthlyTasksChart from "@/components/MonthlyTasksChart"

const TasksChart = () => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Tasks Overview</Text>
      <MonthlyTasksChart />
    </View>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#191919" : "#F7F6F3",
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 24,
      color: isDark ? "#FFFFFF" : "#000000",
      textAlign: "center",
    },
  })

export default TasksChart
