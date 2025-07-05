"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useForm } from "react-hook-form"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card"
import { getGoogleAuthUrl, getXAuthUrl } from "../../utils/api"

function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [registerError, setRegisterError] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isXLoading, setIsXLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setRegisterError("")
      await registerUser(data.name, data.email, data.password)
      navigate("/profile")
    } catch (error) {
      console.error("Registration failed:", error)
      setRegisterError("Registration failed. Please try again.")
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      setRegisterError("")

      console.log("🔄 Getting Google auth URL...")
      const response = await getGoogleAuthUrl()

      console.log("📋 Full response from Google handler:", response.data)

      // El backend devuelve directamente la URL como string
      let googleUrl = null

      if (typeof response.data === "string") {
        // Si la respuesta es directamente un string (la URL)
        googleUrl = response.data
      } else if (response.data && response.data.url) {
        // Si la respuesta es un objeto con propiedad url
        googleUrl = response.data.url
      } else if (response.data && typeof response.data === "object") {
        // Si es un objeto, buscar cualquier propiedad que contenga una URL
        const possibleUrl = Object.values(response.data).find(
          (value) => typeof value === "string" && value.includes("google"),
        )
        googleUrl = possibleUrl
      }

      if (googleUrl && typeof googleUrl === "string" && googleUrl.length > 0) {
        console.log("✅ Google auth URL received:", googleUrl)
        // Redirigir a la URL de Google OAuth
        window.location.href = googleUrl
      } else {
        console.error("❌ Invalid URL format received:", response.data)
        throw new Error("Invalid URL format received from Google auth handler")
      }
    } catch (error) {
      console.error("❌ Google registration failed:", error)
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      setRegisterError("Failed to initialize Google registration. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  const handleXLogin = async () => {
    try {
      setIsXLoading(true)
      setRegisterError("")

      console.log("🔄 Getting X auth URL...")
      const response = await getXAuthUrl()

      console.log("📋 Full response from X handler:", response.data)

      // El backend devuelve directamente la URL como string
      let xUrl = null

      if (typeof response.data === "string") {
        // Si la respuesta es directamente un string (la URL)
        xUrl = response.data
      } else if (response.data && response.data.url) {
        // Si la respuesta es un objeto con propiedad url
        xUrl = response.data.url
      } else if (response.data && typeof response.data === "object") {
        // Si es un objeto, buscar cualquier propiedad que contenga una URL
        const possibleUrl = Object.values(response.data).find(
          (value) => typeof value === "string" && (value.includes("twitter") || value.includes("x.com")),
        )
        xUrl = possibleUrl
      }

      if (xUrl && typeof xUrl === "string" && xUrl.length > 0) {
        console.log("✅ X auth URL received:", xUrl)
        // Redirigir a la URL de X OAuth
        window.location.href = xUrl
      } else {
        console.error("❌ Invalid URL format received:", response.data)
        throw new Error("Invalid URL format received from X auth handler")
      }
    } catch (error) {
      console.error("❌ X registration failed:", error)
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      setRegisterError("Failed to initialize X registration. Please try again.")
      setIsXLoading(false)
    }
  }

  return (
    <Card className="w-[350px] mx-auto mt-10 bg-notion-bg dark:bg-notion-dark">
      <CardHeader>
        <CardTitle className="text-notion-text dark:text-notion-text-dark">Register</CardTitle>
        <CardDescription className="text-notion-text-light dark:text-notion-text-dark">
          Create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {registerError && (
            <div className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">{registerError}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-notion-text dark:text-notion-text-dark">
              Name
            </Label>
            <Input
              id="name"
              className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-notion-text dark:text-notion-text-dark">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-notion-text dark:text-notion-text-dark">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">
            Register
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-notion-gray-dark dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-notion-bg dark:bg-notion-dark px-2 text-notion-text-light dark:text-notion-text-dark">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Registration Buttons */}
        <div className="space-y-3">
          {/* Google Registration Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-notion-gray-dark dark:border-gray-600 text-notion-text dark:text-notion-text-dark hover:bg-notion-gray-dark dark:hover:bg-gray-700 bg-transparent"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isXLoading}
          >
            {isGoogleLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-notion-orange mr-2"></div>
                Connecting to Google...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </div>
            )}
          </Button>

          {/* X (Twitter) Registration Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-notion-gray-dark dark:border-gray-600 text-notion-text dark:text-notion-text-dark hover:bg-notion-gray-dark dark:hover:bg-gray-700 bg-transparent"
            onClick={handleXLogin}
            disabled={isGoogleLoading || isXLoading}
          >
            {isXLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-notion-orange mr-2"></div>
                Connecting to X...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Continue with X
              </div>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default Register
