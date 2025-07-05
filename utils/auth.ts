"use client"

import { logoutUser, loginUser, registerUser } from "./api"

export const login = async (email: string, password: string) => {
  console.log("🔐 [AUTH] Starting login process...")
  console.log("🔐 [AUTH] Email:", email)
  console.log("🔐 [AUTH] Password length:", password.length)
  console.log("🔐 [AUTH] Environment check - running on device")

  try {
    console.log("📡 [AUTH] About to call loginUser API...")

    const response = await loginUser({ email, password })

    console.log("✅ [AUTH] API call successful!")
    console.log("✅ [AUTH] Response status:", response.status)
    console.log("✅ [AUTH] Response data:", JSON.stringify(response.data, null, 2))

    // Verificar diferentes estructuras posibles de respuesta
    let userData = null

    if (response.data?.user) {
      console.log("✅ [AUTH] Found user in response.data.user")
      userData = response.data.user
    } else if (response.data && typeof response.data === "object" && response.data.name) {
      console.log("✅ [AUTH] Found user directly in response.data")
      userData = response.data
    } else {
      console.error("❌ [AUTH] No user data found in response:", response.data)
      console.error("❌ [AUTH] Response structure:", Object.keys(response.data || {}))
      throw new Error("No user data received from server")
    }

    if (!userData) {
      throw new Error("Invalid user data received")
    }

    console.log("✅ [AUTH] Login successful with user:", {
      id: userData.id,
      name: userData.name,
      email: userData.email,
    })

    return userData
  } catch (error: any) {
    console.error("❌ [AUTH] Login error occurred:")
    console.error("❌ [AUTH] Error type:", typeof error)
    console.error("❌ [AUTH] Error message:", error.message)

    if (error.response) {
      console.error("❌ [AUTH] Server responded with error:")
      console.error("❌ [AUTH] Status:", error.response.status)
      console.error("❌ [AUTH] Status text:", error.response.statusText)
      console.error("❌ [AUTH] Error data:", error.response.data)
      console.error("❌ [AUTH] Headers:", error.response.headers)
    } else if (error.request) {
      console.error("❌ [AUTH] Network error - no response received:")
      console.error("❌ [AUTH] Request:", error.request)
      console.error("❌ [AUTH] This usually means server is unreachable")
    } else {
      console.error("❌ [AUTH] Setup error:", error.message)
    }

    throw error
  }
}

export const register = async (name: string, email: string, password: string) => {
  console.log("📝 [AUTH] Starting registration process...")
  console.log("📝 [AUTH] Name:", name)
  console.log("📝 [AUTH] Email:", email)
  console.log("📝 [AUTH] Password length:", password.length)

  try {
    console.log("📡 [AUTH] About to call registerUser API...")

    const response = await registerUser({ name, email, password })

    console.log("✅ [AUTH] Registration API call successful!")
    console.log("✅ [AUTH] Response status:", response.status)
    console.log("✅ [AUTH] Response data:", JSON.stringify(response.data, null, 2))

    // Verificar diferentes estructuras posibles de respuesta
    let userData = null

    if (response.data?.user) {
      console.log("✅ [AUTH] Found user in response.data.user")
      userData = response.data.user
    } else if (response.data && typeof response.data === "object" && response.data.name) {
      console.log("✅ [AUTH] Found user directly in response.data")
      userData = response.data
    } else {
      console.error("❌ [AUTH] No user data found in response:", response.data)
      console.error("❌ [AUTH] Response structure:", Object.keys(response.data || {}))
      throw new Error("No user data received from server")
    }

    if (!userData) {
      throw new Error("Invalid user data received")
    }

    console.log("✅ [AUTH] Registration successful with user:", {
      id: userData.id,
      name: userData.name,
      email: userData.email,
    })

    return userData
  } catch (error: any) {
    console.error("❌ [AUTH] Registration error occurred:")
    console.error("❌ [AUTH] Error type:", typeof error)
    console.error("❌ [AUTH] Error message:", error.message)

    if (error.response) {
      console.error("❌ [AUTH] Server responded with error:")
      console.error("❌ [AUTH] Status:", error.response.status)
      console.error("❌ [AUTH] Status text:", error.response.statusText)
      console.error("❌ [AUTH] Error data:", error.response.data)
    } else if (error.request) {
      console.error("❌ [AUTH] Network error - no response received:")
      console.error("❌ [AUTH] Request:", error.request)
      console.error("❌ [AUTH] This usually means server is unreachable")
    } else {
      console.error("❌ [AUTH] Setup error:", error.message)
    }

    throw error
  }
}

export const logout = async () => {
  console.log("🚪 [AUTH] Starting logout process...")

  try {
    console.log("📡 [AUTH] Making DELETE request to /auth/logout...")

    // Hacer logout en el servidor usando DELETE
    const response = await logoutUser()

    console.log("✅ [AUTH] Server logout successful:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    })

    console.log("🧹 [AUTH] Server logout completed successfully")
    return response
  } catch (error: any) {
    console.error("❌ [AUTH] Server logout failed:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
    })

    console.warn("⚠️ [AUTH] Server logout failed, but continuing with local logout")

    // No lanzar el error - permitir que el logout local continúe
    // El AuthContext manejará la limpieza local
    throw error
  }
}

export const isAuthenticated = async () => {
  try {
    const { getUserProfile } = await import("./api")
    await getUserProfile()
    return true
  } catch (error) {
    return false
  }
}
