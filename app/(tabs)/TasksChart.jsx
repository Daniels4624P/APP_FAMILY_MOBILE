import MonthlyTasksChart from "../../components/MonthlyTasksChart"

const TasksChart = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-notion-text dark:text-notion-text-dark">Monthly Tasks Overview</h1>
      <MonthlyTasksChart />
    </div>
  )
}

export default TasksChart
