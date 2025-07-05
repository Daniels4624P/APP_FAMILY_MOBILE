"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { BarChart3, Calendar, TrendingUp, ArrowLeft } from "lucide-react-native"
import { router } from "expo-router"
import MonthlyTasksChart from "@/components/MonthlyTasksChart"

export default function TasksAnalyticsScreen() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  const analyticsOptions = [
    {
      title: "Monthly Overview",
      description: "View tasks completed by month",
      icon: Calendar,
      color: "#3B82F6",
      active: true,
    },
    {
      title: "Productivity Trends",
      description: "Analyze your productivity patterns",
      icon: TrendingUp,
      color: "#10B981",
      active: false,
    },
    {
      title: "Detailed Reports",
      description: "Export and view detailed reports",
      icon: BarChart3,
      color: "#8B5CF6",
      active: false,
    },
  ]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Tasks Analytics</Text>
          <Text style={styles.subtitle}>Monitor your productivity and task completion patterns</Text>
        </View>
      </View>

      {/* Analytics Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Analytics Views</Text>
        <View style={styles.optionsGrid}>
          {analyticsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, option.active && styles.optionCardActive]}
              disabled={!option.active}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <option.icon size={24} color="white" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, option.active && styles.optionTitleActive]}>{option.title}</Text>
                <Text style={[styles.optionDescription, !option.active && styles.optionDescriptionDisabled]}>
                  {option.description}
                </Text>
              </View>
              {option.active && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart Component */}
      <View style={styles.chartContainer}>
        <MonthlyTasksChart />
      </View>
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
      paddingBottom: 32,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    optionsContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    optionsTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 16,
    },
    optionsGrid: {
      gap: 12,
    },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 16,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      opacity: 0.6,
    },
    optionCardActive: {
      opacity: 1,
      borderWidth: 2,
      borderColor: "#FF6B35",
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 4,
    },
    optionTitleActive: {
      color: isDark ? "#FFFFFF" : "#000000",
    },
    optionDescription: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
      lineHeight: 18,
    },
    optionDescriptionDisabled: {
      opacity: 0.7,
    },
    activeIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#FF6B35",
    },
    chartContainer: {
      paddingHorizontal: 4,
    },
  })
