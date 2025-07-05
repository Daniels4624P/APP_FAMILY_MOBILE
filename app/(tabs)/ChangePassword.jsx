"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { changePassword } from "../../utils/api"
import { useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "../../contexts/ThemeContext"

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()

  const [token, setToken] = useState("")

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tokenFromUrl = searchParams.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setMessage("Invalid or missing token. Please use the link from your email.")
    }
  }, [location])

  const onSubmit = async (data) => {
    if (!token) {
      setMessage("Invalid or missing token. Please use the link from your email.")
      return
    }

    setIsSubmitting(true)
    setMessage("")
    try {
      const response = await changePassword(token, data.newPassword)
      setMessage(response.data.message || "Password changed successfully. You can now log in with your new password.")
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error) {
      setMessage(error.response?.data?.message || "Error changing password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-notion-bg dark:bg-[#191919] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-[#202020] rounded-lg shadow-lg">
          <p className="text-center text-gray-900 dark:text-white">
            Loading... If this message persists, the token might be missing or invalid.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-notion-bg dark:bg-[#191919] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-[#202020] rounded-lg shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Change Password</h2>
        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.includes("Error")
                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200"
                : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200"
            } transition-colors duration-200`}
          >
            {message}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
              {...register("newPassword", {
                required: "New password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters long" },
              })}
            />
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === watch("newPassword") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange disabled:opacity-50 transition-colors duration-200"
            >
              {isSubmitting ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
