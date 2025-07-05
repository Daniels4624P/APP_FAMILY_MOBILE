"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from "react-native"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { User, LogOut, Moon, Sun, Shield, Bell, CircleHelp as HelpCircle, Edit3, Save, X } from "lucide-react-native"
import { updateProfile, getUserProfile } from "@/utils/api"

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editedName, setEditedName] = useState(user?.name || "")
  const [editedEmail, setEditedEmail] = useState(user?.email || "")
  const isDark = theme === "dark"
  const styles = createStyles(isDark)

  // Actualizar los campos cuando cambie el usuario
  useEffect(() => {
    setEditedName(user?.name || "")
    setEditedEmail(user?.email || "")
  }, [user])

  const handleLogout = () => {
    console.log("🚪 [PROFILE] Logout button pressed!")

    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            console.log("🚪 [PROFILE] User confirmed logout")
            setIsLoggingOut(true)

            try {
              console.log("🚪 [PROFILE] Calling logout from AuthContext...")
              await logout()
              console.log("✅ [PROFILE] Logout completed successfully")
              // La redirección se maneja en AuthContext
            } catch (error) {
              console.error("❌ [PROFILE] Logout error:", error)
              Alert.alert("Error", "There was an issue logging out, but you have been logged out locally.")
              // Incluso si hay error, el usuario ya fue deslogueado localmente
            } finally {
              setIsLoggingOut(false)
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Name cannot be empty")
      return
    }

    if (!editedEmail.trim()) {
      Alert.alert("Error", "Email cannot be empty")
      return
    }

    setIsUpdating(true)
    try {
      console.log("💾 [PROFILE] Updating profile...")

      // Actualizar perfil en el servidor
      const response = await updateProfile({
        name: editedName.trim(),
        email: editedEmail.trim(),
      })

      console.log("✅ [PROFILE] Profile updated successfully:", response.data)

      // Obtener el perfil actualizado del servidor
      const updatedProfileResponse = await getUserProfile()
      if (updatedProfileResponse.data) {
        // Actualizar el contexto con los datos más recientes
        updateUser(updatedProfileResponse.data)
        console.log("✅ [PROFILE] User context updated with fresh data")
      }

      setIsEditing(false)
      Alert.alert("Success", "Profile updated successfully!")
    } catch (error: any) {
      console.error("❌ [PROFILE] Profile update failed:", error)
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedName(user?.name || "")
    setEditedEmail(user?.email || "")
    setIsEditing(false)
  }

  const profileOptions = [
    {
      title: "Theme",
      description: `Switch to ${isDark ? "light" : "dark"} mode`,
      icon: isDark ? Sun : Moon,
      onPress: toggleTheme,
      showArrow: false,
    },
    {
      title: "Notifications",
      description: "Manage notification preferences",
      icon: Bell,
      onPress: () => {
        Alert.alert("Coming Soon", "Notification settings will be available soon!")
      },
      showArrow: true,
    },
    {
      title: "Privacy & Security",
      description: "Manage your privacy settings",
      icon: Shield,
      onPress: () => {
        Alert.alert("Coming Soon", "Privacy settings will be available soon!")
      },
      showArrow: true,
    },
    {
      title: "Help & Support",
      description: "Get help and contact support",
      icon: HelpCircle,
      onPress: () => {
        Alert.alert("Help & Support", "Contact us at support@yourapp.com for assistance.")
      },
      showArrow: true,
    },
  ]

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#FFFFFF" />
            </View>
          </View>

          {/* Información del usuario editable */}
          <View style={styles.userInfo}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <TextInput
                  style={styles.editInput}
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={handleCancelEdit}
                    disabled={isUpdating}
                    activeOpacity={0.7}
                  >
                    <X size={16} color="#FFFFFF" />
                    <Text style={styles.editButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveButton, isUpdating && styles.disabledButton]}
                    onPress={handleSaveProfile}
                    disabled={isUpdating}
                    activeOpacity={0.7}
                  >
                    <Save size={16} color="#FFFFFF" />
                    <Text style={styles.editButtonText}>{isUpdating ? "Saving..." : "Save"}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.nameContainer}>
                  <Text style={styles.name}>{user?.name || "User"}</Text>
                  <TouchableOpacity style={styles.editIcon} onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                    <Edit3 size={20} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.email}>{user?.email || "user@example.com"}</Text>
              </>
            )}

            {user?.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {profileOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionItem} onPress={option.onPress} activeOpacity={0.7}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <option.icon size={20} color="#FF6B35" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
              {option.showArrow && <Text style={styles.arrow}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón de logout mejorado */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.8}
          >
            <LogOut size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>{isLoggingOut ? "Logging out..." : "Logout"}</Text>
          </TouchableOpacity>
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
      paddingBottom: 100,
    },
    header: {
      alignItems: "center",
      marginBottom: 40,
    },
    avatarContainer: {
      marginBottom: 15,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#FF6B35",
      justifyContent: "center",
      alignItems: "center",
    },
    userInfo: {
      alignItems: "center",
      width: "100%",
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#000000",
      marginRight: 10,
    },
    editIcon: {
      padding: 5,
    },
    email: {
      fontSize: 16,
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginBottom: 10,
    },
    editInput: {
      width: "100%",
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      color: isDark ? "#FFFFFF" : "#000000",
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor: isDark ? "#2D2D2D" : "#E5E5E5",
    },
    editButtons: {
      flexDirection: "row",
      gap: 10,
      marginTop: 10,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 5,
    },
    cancelButton: {
      backgroundColor: "#6B7280",
    },
    saveButton: {
      backgroundColor: "#10B981",
    },
    disabledButton: {
      backgroundColor: "#9CA3AF",
    },
    editButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    adminBadge: {
      backgroundColor: "#10B981",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 10,
    },
    adminBadgeText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 15,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "#202020" : "#FFFFFF",
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    optionLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    optionText: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#000000",
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    arrow: {
      fontSize: 20,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    logoutContainer: {
      marginTop: 20,
      paddingHorizontal: 0,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EF4444",
      padding: 18,
      borderRadius: 12,
      minHeight: 56,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    logoutButtonDisabled: {
      backgroundColor: "#9CA3AF",
    },
    logoutButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 10,
    },
  })
