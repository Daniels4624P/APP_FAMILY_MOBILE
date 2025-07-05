"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { exportFinances, getAccountStatistics } from "../../utils/api"
import { Download } from "lucide-react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

const Finances = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [accountStats, setAccountStats] = useState([])
  const [chartData, setChartData] = useState(null)
  const [statsError, setStatsError] = useState("")
  const [transactionType, setTransactionType] = useState("public") // Tipo de transacción por defecto

  useEffect(() => {
    fetchAccountStatistics()
  }, [])

  const fetchAccountStatistics = async () => {
    try {
      setStatsError("")
      setIsLoading(true)
      const response = await getAccountStatistics()
      setAccountStats(response.data)
      prepareChartData(response.data)
    } catch (error) {
      console.error("Error fetching account statistics:", error)
      setStatsError(`Error loading account statistics: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const prepareChartData = (stats) => {
    if (!stats || stats.length === 0) {
      setStatsError("No account statistics available.")
      return
    }

    const labels = stats.map((stat) => stat.cuentaNombre)
    const incomeData = stats.map((stat) => stat.totalIncomes)
    const expenseData = stats.map((stat) => stat.totalExpenses)

    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Ingresos",
          data: incomeData,
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
        {
          label: "Gastos",
          data: expenseData,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    })
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setMessage("")
    try {
      // Modificar la llamada a exportFinances para incluir el tipo de transacción
      const response = await exportFinances(data.year, data.month, transactionType);

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: "text/csv" })

      // Create a link element and trigger the download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `finances-${data.year}-${data.month}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage("File downloaded successfully!")
    } catch (error) {
      console.error("Error exporting finances:", error)
      setMessage(`Error downloading file: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Account Statistics</h2>
        {statsError && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
            {statsError}
          </div>
        )}
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading account statistics...</p>
        ) : chartData ? (
          <div className="w-full max-w-xl mx-auto">
            <Pie
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      color: "rgb(156, 163, 175)",
                    },
                  },
                  title: {
                    display: true,
                    text: "Ingresos y Gastos por Cuenta",
                    color: "rgb(156, 163, 175)",
                    font: {
                      size: 16,
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No account statistics available.</p>
        )}
      </div>

      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Export Finances</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Year</label>
              <select
                {...register("year", { required: "Year is required" })}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
              >
                <option value="">Select year</option>
                {[...Array(10)].map((_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
              {errors.year && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Month</label>
              <select
                {...register("month", { required: "Month is required" })}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
              >
                <option value="">Select month</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              {errors.month && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.month.message}</p>}
            </div>
          </div>
          {/* Selector de tipo de transacción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Transaction Type</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Export CSV</span>
                </>
              )}
            </button>
          </div>
        </form>... {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.includes("Error")
                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200"
                : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default Finances
