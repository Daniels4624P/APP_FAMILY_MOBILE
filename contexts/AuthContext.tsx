"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, useCallback, useRef } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { login, register, logout } from "@/utils/auth"
import { setAuthContextUpdater, getGoogleAuthUrl, getXAuthUrl, handleGoogleCallback, handleXCallback } from "@/utils/api"
import { router } from "expo-router"
import Loader from "@/components/Loader"
import * as WebBrowser from 'expo-web-browser'

interface User {
  id: string
  name: string
  email: string
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  checkAuthStatus: (skipRedirect?: boolean) => Promise<boolean>
  updateUser: (userData: User | null) => void
  loginWithGoogle: () => Promise<void>
  loginWithTwitter: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const userRef = useRef<User | null>(null)

  // Función para actualizar el usuario
  const updateUser = useCallback(
    (userData: User | null) => {
      console.log("🔄 [AUTH_CONTEXT] Direct user update called:", userData)

      if (userData) {
        console.log("✅ [AUTH_CONTEXT] Setting user data:", userData)
        setUser(userData)
        userRef.current = userData
        AsyncStorage.setItem("user", JSON.stringify(userData))

        if (!authChecked) {
          setAuthChecked(true)
        }
      } else {
        console.log("🧹 [AUTH_CONTEXT] Clearing user data")
        setUser(null)
        userRef.current = null
        AsyncStorage.removeItem("user")
      }
    },
    [authChecked],
  )

  // Registrar la función de actualización en el interceptor
  useEffect(() => {
    console.log("🔧 [AUTH_CONTEXT] Registering auth context updater...")
    setAuthContextUpdater(updateUser)
    console.log("✅ [AUTH_CONTEXT] Auth context updater registered")
  }, [updateUser])

  // Función para verificar el estado de autenticación
  const checkAuthStatus = useCallback(async (skipRedirect = false) => {
    try {
      console.log("🔍 [AUTH_CONTEXT] Checking auth status...")

      // Primero verificar AsyncStorage
      const storedUser = await AsyncStorage.getItem("user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        console.log("✅ [AUTH_CONTEXT] User found in storage:", userData)
        setUser(userData)
        userRef.current = userData
        return true
      }

      // Si no hay usuario en storage, verificar con el servidor
      const { getUserProfile } = await import("@/utils/api")
      const response = await getUserProfile({ skipAuthRefresh: true })
      if (response.data) {
        console.log("✅ [AUTH_CONTEXT] User authenticated:", response.data)
        setUser(response.data)
        userRef.current = response.data
        await AsyncStorage.setItem("user", JSON.stringify(response.data))
        return true
      } else {
        console.log("❌ [AUTH_CONTEXT] No user data in response")
        setUser(null)
        userRef.current = null
        await AsyncStorage.removeItem("user")
        return false
      }
    } catch (error) {
      console.log("❌ [AUTH_CONTEXT] No active session:", error)
      setUser(null)
      userRef.current = null
      await AsyncStorage.removeItem("user")
      return false
    }
  }, [])

  // Efecto para la verificación inicial de autenticación
  useEffect(() => {
    if (authChecked) return

    const initAuth = async () => {
      console.log("🚀 [AUTH_CONTEXT] Initializing auth check")
      await checkAuthStatus(true)
      setLoading(false)
      setAuthChecked(true)
    }

    initAuth()
  }, [authChecked, checkAuthStatus])

  // Login
  const authLogin = async (email: string, password: string) => {
    try {
      const userData = await login(email, password)

      if (!userData) {
        throw new Error("No user data received from login")
      }

      console.log("✅ [AUTH_CONTEXT] Login successful, setting user:", userData)
      setUser(userData)
      userRef.current = userData
      setAuthChecked(true)
      await AsyncStorage.setItem("user", JSON.stringify(userData))

      // Redireccionar al home después del login
      console.log("🔄 [AUTH_CONTEXT] Redirecting to home after login")
      router.replace("/")

      return userData
    } catch (error) {
      console.error("❌ [AUTH_CONTEXT] Login failed:", error)
      setUser(null)
      userRef.current = null
      await AsyncStorage.removeItem("user")
      throw error
    }
  }

  // Register
  const authRegister = async (name: string, email: string, password: string) => {
    try {
      const userData = await register(name, email, password)

      if (!userData) {
        throw new Error("No user data received from register")
      }

      console.log("✅ [AUTH_CONTEXT] Register successful, setting user:", userData)
      setUser(userData)
      userRef.current = userData
      setAuthChecked(true)
      await AsyncStorage.setItem("user", JSON.stringify(userData))

      // Redireccionar al home después del registro
      console.log("🔄 [AUTH_CONTEXT] Redirecting to home after register")
      router.replace("/")

      return userData
    } catch (error) {
      console.error("❌ [AUTH_CONTEXT] Register failed:", error)
      setUser(null)
      userRef.current = null
      await AsyncStorage.removeItem("user")
      throw error
    }
  }

  // Google OAuth Login
  const loginWithGoogle = async () => {
    try {
      console.log("🔄 [AUTH_CONTEXT] Starting Google OAuth...")
      const response = await getGoogleAuthUrl()
      
      if (response.data && response.data.authUrl) {
        console.log("✅ [AUTH_CONTEXT] Received Google auth URL, redirecting...")
        
        const result = await WebBrowser.openAuthSessionAsync(
          response.data.authUrl, 
          'myapp://auth/google/callback'
        )
        
        if (result.type === 'success' && result.url) {
          const url = new URL(result.url)
          const code = url.searchParams.get('code')
          const state = url.searchParams.get('state')
          
          if (code && state) {
            console.log("🔄 [AUTH_CONTEXT] Processing Google callback...")
            const callbackResponse = await handleGoogleCallback(state, code)
            
            if (callbackResponse.data) {
              console.log("✅ [AUTH_CONTEXT] Google login successful:", callbackResponse.data)
              setUser(callbackResponse.data)
              userRef.current = callbackResponse.data
              setAuthChecked(true)
              await AsyncStorage.setItem("user", JSON.stringify(callbackResponse.data))
              
              // Redireccionar al home después del login
              console.log("🔄 [AUTH_CONTEXT] Redirecting to home after Google login")
              router.replace("/")
            }
          }
        }
      } else {
        throw new Error('No auth URL received from server')
      }
    } catch (error) {
      console.error("❌ [AUTH_CONTEXT] Google login failed:", error)
      throw error
    }
  }

  // Twitter OAuth Login
  const loginWithTwitter = async () => {
    try {
      console.log("🔄 [AUTH_CONTEXT] Starting Twitter OAuth...")
      const response = await getXAuthUrl()
      
      if (response.data && response.data.authUrl) {
        console.log("✅ [AUTH_CONTEXT] Received Twitter auth URL, redirecting...")
        
        const result = await WebBrowser.openAuthSessionAsync(
          response.data.authUrl, 
          'myapp://auth/x/callback'
        )
        
        if (result.type === 'success' && result.url) {
          const url = new URL(result.url)
          const code = url.searchParams.get('code')
          const state = url.searchParams.get('state')
          
          if (code && state) {
            console.log("🔄 [AUTH_CONTEXT] Processing Twitter callback...")
            const callbackResponse = await handleXCallback(state, code)
            
            if (callbackResponse.data) {
              console.log("✅ [AUTH_CONTEXT] Twitter login successful:", callbackResponse.data)
              setUser(callbackResponse.data)
              userRef.current = callbackResponse.data
              setAuthChecked(true)
              await AsyncStorage.setItem("user", JSON.stringify(callbackResponse.data))
              
              // Redireccionar al home después del login
              console.log("🔄 [AUTH_CONTEXT] Redirecting to home after Twitter login")
              router.replace("/")
            }
          }
        }
      } else {
        throw new Error('No auth URL received from server')
      }
    } catch (error) {
      console.error("❌ [AUTH_CONTEXT] Twitter login failed:", error)
      throw error
    }
  }

  // Logout mejorado con redirección
  const authLogout = async () => {
    console.log("🚪 [AUTH_CONTEXT] Starting logout process...")

    try {
      // Intentar hacer logout en el servidor
      console.log("📡 [AUTH_CONTEXT] Calling server logout...")
      await logout()
      console.log("✅ [AUTH_CONTEXT] Server logout successful")
    } catch (error) {
      console.error("❌ [AUTH_CONTEXT] Server logout failed:", error)
      // Continuar con logout local incluso si falla el servidor
      console.log("⚠️ [AUTH_CONTEXT] Proceeding with local logout despite server error")
    }

    // Siempre limpiar el estado local
    console.log("🧹 [AUTH_CONTEXT] Clearing local user state...")
    setUser(null)
    userRef.current = null

    try {
      await AsyncStorage.multiRemove(["user", "token"])
      console.log("✅ [AUTH_CONTEXT] Local storage cleared")
    } catch (storageError) {
      console.error("❌ [AUTH_CONTEXT] Error clearing storage:", storageError)
    }

    // Redireccionar al home después del logout
    console.log("🔄 [AUTH_CONTEXT] Redirecting to home after logout")
    router.replace("/")

    console.log("✅ [AUTH_CONTEXT] Logout process completed")
  }

  const isAuthenticated = user !== null

  // Debug log para cambios en el estado del usuario
  useEffect(() => {
    console.log("👤 [AUTH_CONTEXT] User state changed:", {
      isAuthenticated,
      user: user ? { id: user.id, name: user.name } : null,
      timestamp: new Date().toISOString(),
    })
  }, [user, isAuthenticated])

  if (loading) {
    return <Loader size="large" />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login: authLogin,
        register: authRegister,
        logout: authLogout,
        setUser,
        checkAuthStatus,
        updateUser,
        loginWithGoogle,
        loginWithTwitter,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}