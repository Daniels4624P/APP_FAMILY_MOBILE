import { useState, useEffect } from "react";
import { getUsersPoints } from "../../utils/api";
import Loader from "../../components/Loader";

function UsersPoints() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsersPoints = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUsersPoints();
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching user points:", err);
        setError("Failed to load user points. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsersPoints();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-notion-bg dark:bg-notion-dark">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-notion-text dark:text-notion-text-dark p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-notion-bg dark:bg-notion-dark rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-notion-text dark:text-notion-text-dark">User Points</h2>
      <table className="w-full border-collapse border border-notion-gray dark:border-notion-text-dark">
        <thead>
          <tr className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark">
            <th className="border border-notion-gray dark:border-notion-text-dark px-4 py-2">Name</th>
            <th className="border border-notion-gray dark:border-notion-text-dark px-4 py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="text-center">
              <td className="border border-notion-gray dark:border-notion-text-dark px-4 py-2">{user.name}</td>
              <td className="border border-notion-gray dark:border-notion-text-dark px-4 py-2">{user.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersPoints;
