"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Alert } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import TaskCalendar from "@/components/TaskCalendar"
import Loader from "@/components/Loader"

interface Task {
  id: string
  task: string
  description?: string
  dateStart: string
  dateEnd?: string
  completed: boolean
  local?: boolean
  timeZone?: string
  reminderMinutesPopup?: number
  reminderMinutesEmail?: number
}

export default function TasksCalendarScreen() {
  const { theme } = useTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)

      // Datos de ejemplo para demostración
      const exampleTasks: Task[] = [
        {
          id: "1",
          task: "Reunión de equipo",
          description: "Reunión semanal del equipo de desarrollo",
          dateStart: new Date().toISOString(),
          completed: false,
          local: true,
        },
        {
          id: "2",
          task: "Presentación del proyecto",
          description: "Presentar el avance del proyecto a los stakeholders",
          dateStart: new Date(Date.now() + 86400000).toISOString(), // Mañana
          completed: false,
          local: false,
          reminderMinutesPopup: 15,
        },
        {
          id: "3",
          task: "Revisión de código",
          description: "Revisar pull requests pendientes",
          dateStart: new Date(Date.now() + 2 * 86400000).toISOString(), // Pasado mañana
          completed: true,
          local: true,
        },
      ]

      setTasks(exampleTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      Alert.alert("Error", "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleEditTask = (task: Task) => {
    console.log("Edit task:", task)
    Alert.alert("Editar Tarea", `Editar: ${task.task}`)
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks(tasks.filter((task) => task.id !== taskId))
      Alert.alert("Éxito", "Tarea eliminada correctamente")
    } catch (error) {
      console.error("Error deleting task:", error)
      Alert.alert("Error", "Failed to delete task")
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task)))
      Alert.alert("Éxito", "Tarea completada")
    } catch (error) {
      console.error("Error completing task:", error)
      Alert.alert("Error", "Failed to complete task")
    }
  }

  if (loading) {
    return <Loader size="large" text="Loading calendar..." />
  }

  return (
    <View style={styles.container}>
      <TaskCalendar
        tasks={tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onCompleteTask={handleCompleteTask}
      />
    </View>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#191919" : "#F7F6F3",
    },
  })
