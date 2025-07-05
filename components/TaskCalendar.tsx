"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, Alert } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Bell,
  Mail,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react-native"

const { width: screenWidth } = Dimensions.get("window")

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

interface TaskCalendarProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
}

type ViewType = "month" | "week" | "day"

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks = [], onEditTask, onDeleteTask, onCompleteTask }) => {
  const { theme } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>("month")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  // Filtrar y procesar tareas de forma segura
  const taskEvents = useMemo(() => {
    if (!Array.isArray(tasks)) {
      console.warn("Tasks is not an array:", tasks)
      return []
    }

    return tasks
      .filter((task) => {
        if (!task || typeof task !== "object") return false
        const hasDateStart = task.dateStart && task.dateStart !== null && task.dateStart !== undefined
        return hasDateStart
      })
      .map((task) => {
        try {
          const startDate = new Date(task.dateStart)
          const endDate = task.dateEnd ? new Date(task.dateEnd) : new Date(task.dateStart)

          // Verificar que las fechas sean válidas
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn("Invalid date in task:", task)
            return null
          }

          return {
            ...task,
            startDate,
            endDate,
            color: task.completed ? "#10B981" : "#3B82F6",
          }
        } catch (error) {
          console.error("Error processing task:", task, error)
          return null
        }
      })
      .filter(Boolean) // Remover elementos null
  }, [tasks])

  // Navegación de fechas
  const navigateDate = (direction: "prev" | "next" | "today") => {
    try {
      const newDate = new Date(currentDate)

      if (direction === "today") {
        setCurrentDate(new Date())
        return
      }

      switch (view) {
        case "month":
          newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
          break
        case "week":
          newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
          break
        case "day":
          newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
          break
      }

      setCurrentDate(newDate)
    } catch (error) {
      console.error("Error navigating date:", error)
    }
  }

  // Obtener tareas para una fecha específica
  const getTasksForDate = (date: Date) => {
    try {
      return taskEvents.filter((task) => {
        if (!task || !task.startDate) return false
        const taskDate = new Date(task.startDate)
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        )
      })
    } catch (error) {
      console.error("Error getting tasks for date:", error)
      return []
    }
  }

  // Renderizar vista de mes
  const renderMonthView = () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      const currentDateForLoop = new Date(startDate)

      // Generar 42 días (6 semanas)
      for (let i = 0; i < 42; i++) {
        const dayTasks = getTasksForDate(currentDateForLoop)
        const isCurrentMonth = currentDateForLoop.getMonth() === month
        const isToday = currentDateForLoop.toDateString() === new Date().toDateString()

        days.push({
          date: new Date(currentDateForLoop),
          tasks: dayTasks,
          isCurrentMonth,
          isToday,
        })

        currentDateForLoop.setDate(currentDateForLoop.getDate() + 1)
      }

      return (
        <View style={styles.monthContainer}>
          {/* Días de la semana */}
          <View style={styles.weekHeader}>
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <Text key={day} style={styles.weekHeaderText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Días del mes */}
          <View style={styles.monthGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellInactive,
                  day.isToday && styles.dayCellToday,
                ]}
                onPress={() => {
                  if (day.tasks.length > 0) {
                    setSelectedTask(day.tasks[0])
                  }
                }}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    !day.isCurrentMonth && styles.dayNumberInactive,
                    day.isToday && styles.dayNumberToday,
                  ]}
                >
                  {day.date.getDate()}
                </Text>
                {day.tasks.length > 0 && (
                  <View style={styles.taskIndicators}>
                    {day.tasks.slice(0, 3).map((task, taskIndex) => (
                      <View key={taskIndex} style={[styles.taskIndicator, { backgroundColor: task.color }]} />
                    ))}
                    {day.tasks.length > 3 && <Text style={styles.moreTasksText}>+{day.tasks.length - 3}</Text>}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    } catch (error) {
      console.error("Error rendering month view:", error)
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading calendar</Text>
        </View>
      )
    }
  }

  // Renderizar vista de semana
  const renderWeekView = () => {
    try {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

      const weekDays = []
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek)
        day.setDate(startOfWeek.getDate() + i)
        weekDays.push({
          date: day,
          tasks: getTasksForDate(day),
          isToday: day.toDateString() === new Date().toDateString(),
        })
      }

      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.weekContainer}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDay}>
                <View style={[styles.weekDayHeader, day.isToday && styles.weekDayHeaderToday]}>
                  <Text style={[styles.weekDayName, day.isToday && styles.weekDayNameToday]}>
                    {day.date.toLocaleDateString("es-ES", { weekday: "short" })}
                  </Text>
                  <Text style={[styles.weekDayNumber, day.isToday && styles.weekDayNumberToday]}>
                    {day.date.getDate()}
                  </Text>
                </View>
                <ScrollView style={styles.weekDayTasks}>
                  {day.tasks.map((task, taskIndex) => (
                    <TouchableOpacity
                      key={taskIndex}
                      style={[styles.weekTask, { backgroundColor: task.color }]}
                      onPress={() => setSelectedTask(task)}
                    >
                      <Text style={styles.weekTaskText} numberOfLines={2}>
                        {task.task}
                      </Text>
                      {task.local === false && <CalendarIcon size={12} color="white" style={styles.weekTaskIcon} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}
          </View>
        </ScrollView>
      )
    } catch (error) {
      console.error("Error rendering week view:", error)
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading week view</Text>
        </View>
      )
    }
  }

  // Renderizar vista de día
  const renderDayView = () => {
    try {
      const dayTasks = getTasksForDate(currentDate)

      return (
        <ScrollView style={styles.dayContainer}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>
              {currentDate.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {dayTasks.length === 0 ? (
            <View style={styles.emptyDay}>
              <Text style={styles.emptyDayText}>No hay tareas para este día</Text>
            </View>
          ) : (
            <View style={styles.dayTasks}>
              {dayTasks.map((task, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayTask, { borderLeftColor: task.color }]}
                  onPress={() => setSelectedTask(task)}
                >
                  <View style={styles.dayTaskHeader}>
                    <Text style={styles.dayTaskTitle}>{task.task}</Text>
                    {task.local === false && <CalendarIcon size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />}
                  </View>
                  {task.description && (
                    <Text style={styles.dayTaskDescription} numberOfLines={2}>
                      {task.description}
                    </Text>
                  )}
                  <Text style={styles.dayTaskTime}>
                    {task.startDate.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {task.endDate && task.endDate.getTime() !== task.startDate.getTime() && (
                      <Text>
                        {" - "}
                        {task.endDate.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )
    } catch (error) {
      console.error("Error rendering day view:", error)
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading day view</Text>
        </View>
      )
    }
  }

  const formatDateLabel = () => {
    try {
      switch (view) {
        case "month":
          return currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        case "week":
          const startOfWeek = new Date(currentDate)
          startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(startOfWeek.getDate() + 6)
          return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
        case "day":
          return currentDate.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        default:
          return ""
      }
    } catch (error) {
      console.error("Error formatting date label:", error)
      return "Error"
    }
  }

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateDate("prev")}>
            <ChevronLeft size={20} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateDate("next")}>
            <ChevronRight size={20} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text style={styles.dateLabel}>{formatDateLabel()}</Text>
          <TouchableOpacity style={styles.todayButton} onPress={() => navigateDate("today")}>
            <Text style={styles.todayButtonText}>Hoy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewButtons}>
          {[
            { label: "Mes", value: "month" as ViewType },
            { label: "Semana", value: "week" as ViewType },
            { label: "Día", value: "day" as ViewType },
          ].map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[styles.viewButton, view === value && styles.viewButtonActive]}
              onPress={() => setView(value)}
            >
              <Text style={[styles.viewButtonText, view === value && styles.viewButtonTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vista del calendario */}
      <View style={styles.calendarContent}>
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </View>

      {/* Modal de detalles de tarea */}
      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        onComplete={onCompleteTask}
      />
    </View>
  )
}

// Componente del modal de detalles
interface TaskDetailsModalProps {
  task: Task | null
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onComplete: (taskId: string) => void
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onEdit, onDelete, onComplete }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  if (!task) return null

  const handleDelete = () => {
    Alert.alert("Eliminar Tarea", "¿Estás seguro de que quieres eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          onDelete(task.id)
          onClose()
        },
      },
    ])
  }

  const handleComplete = () => {
    onComplete(task.id)
    onClose()
  }

  return (
    <Modal visible={!!task} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{task.task}</Text>
              {task.local === false && (
                <View style={styles.googleBadge}>
                  <CalendarIcon size={12} color="#3B82F6" />
                  <Text style={styles.googleBadgeText}>Google</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descripción:</Text>
              <Text style={styles.detailValue}>{task.description || "Sin descripción"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha de inicio:</Text>
              <Text style={styles.detailValue}>
                {task.dateStart ? new Date(task.dateStart).toLocaleString("es-ES") : "No establecida"}
              </Text>
            </View>

            {task.dateEnd && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha de fin:</Text>
                <Text style={styles.detailValue}>{new Date(task.dateEnd).toLocaleString("es-ES")}</Text>
              </View>
            )}

            {task.timeZone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Zona horaria:</Text>
                <Text style={styles.detailValue}>{task.timeZone}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estado:</Text>
              <Text style={[styles.detailValue, { color: task.completed ? "#10B981" : "#F59E0B" }]}>
                {task.completed ? "Completada" : "Pendiente"}
              </Text>
            </View>

            {(task.reminderMinutesPopup || task.reminderMinutesEmail) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recordatorios:</Text>
                <View style={styles.reminders}>
                  {task.reminderMinutesPopup && (
                    <View style={styles.reminderBadge}>
                      <Bell size={12} color={isDark ? "#FFFFFF" : "#000000"} />
                      <Text style={styles.reminderText}>Popup: {task.reminderMinutesPopup}min</Text>
                    </View>
                  )}
                  {task.reminderMinutesEmail && (
                    <View style={styles.reminderBadge}>
                      <Mail size={12} color={isDark ? "#FFFFFF" : "#000000"} />
                      <Text style={styles.reminderText}>Email: {task.reminderMinutesEmail}min</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.editButton} onPress={() => onEdit(task)}>
              <Pencil size={16} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 size={16} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
            {!task.completed && (
              <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                <CheckCircle size={16} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Completar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#191919" : "#F7F6F3",
    },
    toolbar: {
      padding: 16,
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#E5E7EB",
    },
    navigationContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    navButton: {
      padding: 8,
      marginRight: 8,
    },
    dateLabel: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      flex: 1,
      marginLeft: 8,
    },
    todayButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      borderRadius: 6,
    },
    todayButtonText: {
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#000000",
      fontWeight: "500",
    },
    viewButtons: {
      flexDirection: "row",
      gap: 8,
    },
    viewButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      alignItems: "center",
    },
    viewButtonActive: {
      backgroundColor: "#3B82F6",
    },
    viewButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#FFFFFF" : "#000000",
    },
    viewButtonTextActive: {
      color: "#FFFFFF",
    },
    calendarContent: {
      flex: 1,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: "#EF4444",
      textAlign: "center",
    },
    // Estilos para vista de mes
    monthContainer: {
      flex: 1,
      padding: 16,
    },
    weekHeader: {
      flexDirection: "row",
      marginBottom: 8,
    },
    weekHeaderText: {
      flex: 1,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      paddingVertical: 8,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: (screenWidth - 32) / 7 - 4,
      height: 80,
      margin: 2,
      padding: 4,
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      borderRadius: 8,
      alignItems: "center",
    },
    dayCellInactive: {
      opacity: 0.3,
    },
    dayCellToday: {
      backgroundColor: "#3B82F6",
    },
    dayNumber: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 4,
    },
    dayNumberInactive: {
      color: isDark ? "#6B7280" : "#9CA3AF",
    },
    dayNumberToday: {
      color: "#FFFFFF",
    },
    taskIndicators: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 2,
    },
    taskIndicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    moreTasksText: {
      fontSize: 10,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    // Estilos para vista de semana
    weekContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
    },
    weekDay: {
      width: screenWidth / 7,
      marginRight: 8,
    },
    weekDayHeader: {
      alignItems: "center",
      paddingVertical: 12,
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      borderRadius: 8,
      marginBottom: 8,
    },
    weekDayHeaderToday: {
      backgroundColor: "#3B82F6",
    },
    weekDayName: {
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    weekDayNameToday: {
      color: "#FFFFFF",
    },
    weekDayNumber: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
    },
    weekDayNumberToday: {
      color: "#FFFFFF",
    },
    weekDayTasks: {
      flex: 1,
    },
    weekTask: {
      padding: 8,
      borderRadius: 6,
      marginBottom: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    weekTaskText: {
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: "500",
      flex: 1,
    },
    weekTaskIcon: {
      marginLeft: 4,
    },
    // Estilos para vista de día
    dayContainer: {
      flex: 1,
      padding: 16,
    },
    dayHeader: {
      marginBottom: 20,
    },
    dayTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      textAlign: "center",
    },
    emptyDay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyDayText: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
      fontStyle: "italic",
    },
    dayTasks: {
      gap: 12,
    },
    dayTask: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dayTaskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    dayTaskTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      flex: 1,
    },
    dayTaskDescription: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 8,
      lineHeight: 20,
    },
    dayTaskTime: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
      fontWeight: "500",
    },
    // Estilos del modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      borderRadius: 12,
      width: "100%",
      maxWidth: 400,
      maxHeight: "80%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#E5E7EB",
    },
    modalTitleContainer: {
      flex: 1,
      marginRight: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 8,
    },
    googleBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#1E3A8A" : "#EFF6FF",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
      gap: 4,
    },
    googleBadgeText: {
      fontSize: 12,
      color: "#3B82F6",
      fontWeight: "500",
    },
    closeButton: {
      padding: 4,
    },
    closeButtonText: {
      fontSize: 24,
      color: isDark ? "#9CA3AF" : "#6B7280",
      fontWeight: "300",
    },
    modalBody: {
      padding: 20,
      maxHeight: 300,
    },
    detailRow: {
      marginBottom: 16,
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#000000",
      lineHeight: 22,
    },
    reminders: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    reminderBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    reminderText: {
      fontSize: 12,
      color: isDark ? "#FFFFFF" : "#000000",
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#6B7280",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
    },
    editButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#EF4444",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
    },
    deleteButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
    },
    completeButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FF6B35",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
    },
    completeButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
    },
  })

export default TaskCalendar
