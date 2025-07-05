"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { getUserProfile, getUserHistory, updateProfile, getGoogleCalendarAuthUrl, checkGoogleCalendarAccess } from "../../utils/api"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Alert, AlertDescription } from "../../components/ui/Alert"
import { Calendar, Mail, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import Loader from "../../components/Loader"

function Profile() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "" })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [googleCalendarLoading, setGoogleCalendarLoading] = useState(false)
  const [hasGoogleAccess, setHasGoogleAccess] = useState(false)
  const [checkingGoogleAccess, setCheckingGoogleAccess] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [profileData, historyData] = await Promise.all([getUserProfile(), getUserHistory()])
        setProfile(profileData.data)
        setHistory(Array.isArray(historyData.data) ? historyData.data : [])
        setEditForm({
          name: profileData.data.name || "",
          email: profileData.data.email || "",
        })
        
        // Check Google Calendar access from backend
        await checkGoogleAccess()
      } catch (error) {
        console.error("Error fetching profile data:", error)
        setError("Failed to load profile data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  // Function to check Google Calendar access from backend
  const checkGoogleAccess = async () => {
    try {
      setCheckingGoogleAccess(true)
      const response = await checkGoogleCalendarAccess()
      console.log('🔍 Google Calendar access check response:', response.data)
      setHasGoogleAccess(response.data?.hasAccess === true)
    } catch (error) {
      console.error("Error checking Google Calendar access:", error)
      // If the endpoint doesn't exist, assume no access
      setHasGoogleAccess(false)
    } finally {
      setCheckingGoogleAccess(false)
    }
  }

  // Check Google access periodically or when window gains focus
  useEffect(() => {
    // Check when window gains focus (user might have completed auth in another tab)
    window.addEventListener('focus', checkGoogleAccess)
    
    // Check periodically every 10 seconds
    const interval = setInterval(checkGoogleAccess, 10000)

    return () => {
      window.removeEventListener('focus', checkGoogleAccess)
      clearInterval(interval)
    }
  }, [])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    setUpdateMessage("")
    if (!isEditing && profile) {
      setEditForm({
        name: profile.name || "",
        email: profile.email || "",
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    setUpdateMessage("")

    try {
      const response = await updateProfile(editForm)
      setProfile(response.data)
      setUser(response.data)
      setIsEditing(false)
      setUpdateMessage("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      setUpdateMessage("Failed to update profile. Please try again.")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleGoogleCalendarAuth = async () => {
    setGoogleCalendarLoading(true)
    try {
      const response = await getGoogleCalendarAuthUrl()
      if (response.data) {
        // The response.data contains the Google authorization URL
        window.location.href = response.data
      }
    } catch (error) {
      console.error("Error getting Google Calendar auth URL:", error)
      setUpdateMessage("Failed to initiate Google Calendar authorization. Please try again.")
    } finally {
      setGoogleCalendarLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-notion-bg dark:bg-notion-dark">
        <Loader size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-notion-text dark:text-notion-text-dark p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!profile) {
    return <div className="text-notion-text dark:text-notion-text-dark p-6 text-center">No profile data available.</div>
  }

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Profile</h2>
          <Button
            onClick={handleEditToggle}
            className={`${
              isEditing 
                ? "bg-notion-gray hover:bg-notion-gray-dark text-notion-text" 
                : "bg-notion-orange hover:bg-notion-orange-dark text-white"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {updateMessage && (
          <div className={`mb-4 p-3 rounded ${
            updateMessage.includes("success") 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          }`}>
            {updateMessage}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-notion-text dark:text-notion-text-dark">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark border-notion-gray"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-notion-text dark:text-notion-text-dark">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleInputChange}
                className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark border-notion-gray"
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={updateLoading} 
                className="bg-notion-orange hover:bg-notion-orange-dark text-white"
              >
                {updateLoading ? "Updating..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                onClick={handleEditToggle} 
                className="bg-notion-gray hover:bg-notion-gray-dark text-notion-text"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="mb-2">Name: {profile.name}</p>
            <p className="mb-2">Email: {profile.email}</p>
            <p className="mb-4 text-notion-orange dark:text-notion-orange-dark font-medium">
              Points: {profile.points !== undefined ? profile.points : "Not available"}
            </p>

            {/* Google Calendar Integration Section - Only show if user doesn't have access */}
            {!hasGoogleAccess && !checkingGoogleAccess && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Google Calendar Integration</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Connect your Google Calendar to sync private tasks and enable advanced features
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGoogleCalendarAuth}
                    disabled={googleCalendarLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    {googleCalendarLoading ? (
                      "Connecting..."
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        Authorize Google Calendar
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                  <p>
                    📅 This will allow you to create private tasks that sync with your Google Calendar, including
                    reminders and notifications.
                  </p>
                </div>
              </div>
            )}

            {/* Loading state for checking Google access */}
            {checkingGoogleAccess && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Checking Google Calendar connection...</p>
                </div>
              </div>
            )}

            {/* Google Calendar Connected Status */}
            {hasGoogleAccess && !checkingGoogleAccess && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Google Calendar Connected</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your Google Calendar is connected and ready to sync private tasks with reminders and notifications.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Verification Notice - Only show if Google Calendar is not connected */}
            {profile.email && !hasGoogleAccess && !checkingGoogleAccess && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-amber-700 dark:text-amber-300 text-sm">
                    <strong>Important:</strong> Make sure your email is verified to create private tasks with Google
                    Calendar integration. If you haven't verified your email yet, please check your inbox for a
                    verification link.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task History Card */}
      <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Task History</h2>
        {history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="border-b border-notion-gray dark:border-notion-text-dark pb-2">
                <span className="font-medium">Task: {item.taskId}</span>
                <span className="ml-4 text-notion-text-light dark:text-notion-text-dark">
                  Completed on: {item.hecha}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No task history available.</p>
        )}
      </div>
    </div>
  )
}

export default Profile