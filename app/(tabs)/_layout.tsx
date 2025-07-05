"use client"

import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Home, UserCircle, Wallet, ClipboardList } from "lucide-react-native"
import { useAuth } from "@/contexts/AuthContext"

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { isAuthenticated } = useAuth()

  const isDark = colorScheme === "dark"

  const tabBarStyle = {
    backgroundColor: isDark ? "#202020" : "#F7F6F3",
    borderTopColor: isDark ? "#2F3437" : "#E5E5E5",
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  }

  const tabBarActiveTintColor = "#FF6B35"
  const tabBarInactiveTintColor = isDark ? "#9CA3AF" : "#6B7280"

  // Configuración base para eliminar completamente el header
  const baseScreenOptions = {
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor,
    tabBarInactiveTintColor,
    tabBarShowLabel: true,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: "500",
    },
  }

  // Si NO está autenticado: solo mostrar Home y Login
  if (!isAuthenticated) {
    return (
      <Tabs screenOptions={baseScreenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="auth"
          options={{
            title: "Login",
            tabBarIcon: ({ size, color }) => <UserCircle size={size} color={color} />,
          }}
        />
        {/* Ocultar completamente las demás pestañas */}
        <Tabs.Screen name="finances" options={{ href: null }} />
        <Tabs.Screen name="tasks" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="admin" options={{ href: null }} />
        <Tabs.Screen name="Home" options={{ href: null }} />
        <Tabs.Screen name="Finances" options={{ href: null }} />
        <Tabs.Screen name="Tasks" options={{ href: null }} />
        <Tabs.Screen name="Profile" options={{ href: null }} />
        <Tabs.Screen name="TasksChart" options={{ href: null }} />
        <Tabs.Screen name="Users" options={{ href: null }} />
        <Tabs.Screen name="UsersPoints" options={{ href: null }} />
        <Tabs.Screen name="Categories" options={{ href: null }} />
        <Tabs.Screen name="tasks/chart" options={{ href: null }} />
        <Tabs.Screen name="tasks/calendar" options={{ href: null }} />
        <Tabs.Screen name="tasks/analytics" options={{ href: null }} />
        <Tabs.Screen name="finances/expenses" options={{ href: null }} />
        <Tabs.Screen name="finances/accounts" options={{ href: null }} />
        <Tabs.Screen name="PasswordRecovery" options={{ href: null }} />
        <Tabs.Screen name="ChangePassword" options={{ href: null }} />
        <Tabs.Screen name="Register" options={{ href: null }} />
        <Tabs.Screen name="Projects" options={{ href: null }} />
        <Tabs.Screen name="Expenses" options={{ href: null }} />
        <Tabs.Screen name="Accounts" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="Incomes" options={{ href: null }} />
        <Tabs.Screen name="Folders" options={{ href: null }} />
        <Tabs.Screen name="Login" options={{ href: null }} />
      </Tabs>
    )
  }

  // Si SÍ está autenticado: mostrar Home, Finances, Tasks, Profile
  return (
    <Tabs screenOptions={baseScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: "Finances",
          tabBarIcon: ({ size, color }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ size, color }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => <UserCircle size={size} color={color} />,
        }}
      />
      {/* Ocultar completamente auth y admin cuando está autenticado */}
      <Tabs.Screen name="auth" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="Finances" options={{ href: null }} />
      <Tabs.Screen name="Tasks" options={{ href: null }} />
      <Tabs.Screen name="Profile" options={{ href: null }} />
      <Tabs.Screen name="Home" options={{ href: null }} />
      <Tabs.Screen name="PasswordRecovery" options={{ href: null }} />
      <Tabs.Screen name="ChangePassword" options={{ href: null }} />
      <Tabs.Screen name="TasksChart" options={{ href: null }} />
      <Tabs.Screen name="Users" options={{ href: null }} />
      <Tabs.Screen name="Categories" options={{ href: null }} />
      <Tabs.Screen name="Register" options={{ href: null }} />
      <Tabs.Screen name="Projects" options={{ href: null }} />
      <Tabs.Screen name="Expenses" options={{ href: null }} />
      <Tabs.Screen name="Accounts" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="Incomes" options={{ href: null }} />
      <Tabs.Screen name="Folders" options={{ href: null }} />
      <Tabs.Screen name="Login" options={{ href: null }} />
    </Tabs>
  )
}
