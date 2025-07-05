"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { getAccounts, createAccount, updateAccount, deleteAccount } from "@/utils/api"
import { Pencil, Trash2 } from "lucide-react-native"
import { formatNumber, unformatNumber, formatNumberWithCurrency } from "@/utils/numberFormat"

const Accounts = () => {
  const [accounts, setAccounts] = useState([])
  const [editingAccount, setEditingAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts()
      setAccounts(response.data)
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      saldo: unformatNumber(data.saldo),
      public: data.public === "true",
    }

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formattedData)
      } else {
        await createAccount(formattedData)
      }
      reset()
      setEditingAccount(null)
      fetchAccounts()
    } catch (error) {
      console.error("Error saving account:", error)
    }
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    setValue("name", account.name)
    setValue("tipo", account.tipo)
    setValue("saldo", account.saldo ? account.saldo.toString() : "")
    setValue("public", account.public ? "true" : "false")
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        await deleteAccount(id)
        fetchAccounts()
      } catch (error) {
        console.error("Error deleting account:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {editingAccount ? "Edit Account" : "Create Account"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Account Name</label>
            <input
              type="text"
              {...register("name", { required: "Account name is required" })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Account Type</label>
            <select
              {...register("tipo", { required: "Account type is required" })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="Ahorros">Ahorros</option>
              <option value="Corriente">Corriente</option>
              <option value="Credito">Crédito</option>
            </select>
            {errors.tipo && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tipo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Initial Balance</label>
            <Controller
              name="saldo"
              control={control}
              rules={{ required: "Initial balance is required" }}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    field.onChange(formatNumber(rawValue)); // Solo muestra los puntos, sin "COP"
                  }}
                  value={field.value}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
                />
              )}
            />
            {errors.saldo && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.saldo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Public</label>
            <select
              {...register("public")}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            {editingAccount && (
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(null)
                  reset()
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#2D2D2D] hover:bg-gray-50 dark:hover:bg-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
            >
              {editingAccount ? "Update Account" : "Create Account"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Accounts List</h2>
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No accounts found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#2D2D2D]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type: {account.tipo}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Balance: {formatNumberWithCurrency(account.saldo.toString())}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Public: {account.public ? "Yes" : "No"}</p>
                    {account.createdAt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Created: {account.createdAt.split("T")[0].split("-").reverse().join("/")}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-notion-orange dark:hover:text-notion-orange-dark"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Accounts