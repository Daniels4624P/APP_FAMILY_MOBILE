"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { fetchTasksForMonth } from "@/utils/api"
import { useTheme } from "@/contexts/ThemeContext"
import { SimpleSelect } from "@/components/ui/Select"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert"
import Loader from "@/components/Loader"

const { width: screenWidth } = Dimensions.get("window")

interface TaskData {
  week?: string
  taskCount?: number
  taskcount?: number
}

interface ChartDataItem {
  week: string
  tasks: number
  date: string
}

function MonthlyTasksChart() {
  const { theme } = useTheme()
  const [taskData, setTaskData] = useState<TaskData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching tasks for:", { year: selectedYear, month: selectedMonth })

        const response = await fetchTasksForMonth(selectedYear, selectedMonth)
        console.log("API Response:", response.data)

        setTaskData(Array.isArray(response.data) ? response.data : [])
      } catch (error: any) {
        console.error("Error fetching task data:", error)
        setError(error.response?.data?.message || error.message || "Failed to fetch task data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear, selectedMonth])

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear - 5 + i).toString(),
    label: (currentYear - 5 + i).toString(),
  }))

  // Preparar datos para la gráfica
  const chartData: ChartDataItem[] = taskData.map((item, index) => ({
    week: `Week ${index + 1}`,
    tasks: Number.parseInt((item.taskCount || item.taskcount || 0).toString()),
    date: item.week ? new Date(item.week).toLocaleDateString() : `Week ${index + 1}`,
  }))

  const maxTasks = Math.max(...chartData.map((item) => item.tasks), 1)

  const totalTasks = taskData.reduce(
    (total, item) => total + Number.parseInt((item.taskCount || item.taskcount || 0).toString()),
    0,
  )

  const averageTasks = taskData.length > 0 ? (totalTasks / taskData.length).toFixed(1) : "0"

  const selectedMonthName = months.find((m) => m.value === selectedMonth.toString())?.label

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader size="large" text="Loading tasks..." />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Alert variant="destructive">
          <AlertTitle>Error Loading Tasks</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Controles */}
      <View style={styles.controlsCard}>
        <View style={styles.controlsRow}>
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>Year</Text>
            <SimpleSelect
              options={years}
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              style={styles.select}
            />
          </View>

          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>Month</Text>
            <SimpleSelect
              options={months}
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              style={styles.select}
            />
          </View>
        </View>

        <Text style={styles.title}>
          Tasks for {selectedMonthName} {selectedYear}
        </Text>
      </View>

      {/* Gráfica de barras */}
      {chartData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Tasks Chart</Text>
          <View style={styles.chartContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.barRow}>
                <View style={styles.weekLabel}>
                  <Text style={styles.weekText}>{item.week}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${Math.max((item.tasks / maxTasks) * 100, 5)}%`,
                      },
                    ]}
                  >
                    <Text style={styles.barText}>{item.tasks}</Text>
                  </View>
                </View>
                <View style={styles.dateLabel}>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Información detallada */}
      {taskData.length > 0 ? (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detailed Information</Text>
          <View style={styles.detailsGrid}>
            {taskData.map((item, index) => (
              <View key={index} style={styles.detailItem}>
                <Text style={styles.detailWeek}>Week {index + 1}</Text>
                <Text style={styles.detailTasks}>{item.taskCount || item.taskcount || 0} tasks</Text>
                {item.week && (
                  <Text style={styles.detailDate}>Week of: {new Date(item.week).toLocaleDateString()}</Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText}>
              Total tasks completed: <Text style={styles.summaryValue}>{totalTasks}</Text>
            </Text>
            <Text style={styles.summaryText}>
              Average per week: <Text style={styles.summaryValue}>{averageTasks}</Text>
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No tasks found for {selectedMonthName} {selectedYear}
          </Text>
          <Text style={styles.emptySubtitle}>
            Try selecting a different month or year, or complete some tasks first.
          </Text>
        </View>
      )}
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
      padding: 20,
      paddingTop: 60,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "#191919" : "#F7F6F3",
    },
    controlsCard: {
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
    controlsRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 20,
    },
    selectContainer: {
      flex: 1,
    },
    selectLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 8,
    },
    select: {
      minHeight: 44,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
    },
    chartCard: {
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
    chartTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 16,
    },
    chartContainer: {
      gap: 12,
    },
    barRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    weekLabel: {
      width: 60,
    },
    weekText: {
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? "#FFFFFF" : "#000000",
    },
    barContainer: {
      flex: 1,
      height: 32,
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      borderRadius: 16,
      justifyContent: "center",
    },
    bar: {
      height: 32,
      backgroundColor: "#FF6B35",
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "flex-end",
      paddingRight: 8,
      minWidth: 32,
    },
    barText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "bold",
    },
    dateLabel: {
      width: 80,
    },
    dateText: {
      fontSize: 10,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    detailsCard: {
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
    detailsTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 16,
    },
    detailsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 20,
    },
    detailItem: {
      backgroundColor: isDark ? "#374151" : "#F9FAFB",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#E5E7EB",
      width: (screenWidth - 64) / 2 - 6, // 2 columns with gap
    },
    detailWeek: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 8,
    },
    detailTasks: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#FF6B35",
      marginBottom: 4,
    },
    detailDate: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    summaryCard: {
      backgroundColor: isDark ? "#374151" : "#F9FAFB",
      padding: 16,
      borderRadius: 8,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 4,
    },
    summaryValue: {
      fontWeight: "bold",
      color: "#FF6B35",
    },
    emptyCard: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyTitle: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: "#FF6B35",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 16,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  })

export default MonthlyTasksChart
