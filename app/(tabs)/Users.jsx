import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { getUser } from "../../utils/api"

function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Aquí deberías tener un endpoint para obtener todos los usuarios
        // Por ahora, simularemos con el usuario actual
        const userData = await getUser(user.id)
        setUsers([userData.data])
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (user && user.isAdmin) {
      fetchUsers()
    }
  }, [user])

  if (!user || !user.isAdmin) {
    return <div className="text-notion-text dark:text-notion-text-dark">Access denied. Admin only.</div>
  }

  return (
    <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.id} className="bg-notion-gray dark:bg-notion-dark p-4 rounded-md">
            <p className="font-semibold">Name: {user.name}</p>
            <p>Email: {user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Users

