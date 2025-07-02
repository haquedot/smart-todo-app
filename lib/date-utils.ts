import type { Task, StatusFilterType, DateFilterType } from "./types"

export function getFilteredTasks(tasks: Task[], statusFilter: StatusFilterType, dateFilter: DateFilterType): Task[] {
  // First apply status filter
  let filteredTasks = tasks.filter((task) => {
    switch (statusFilter) {
      case "active":
        return !task.completed
      case "completed":
        return task.completed
      case "all":
      default:
        return true
    }
  })

  // Then apply date filter if not "all"
  if (dateFilter === "all") {
    return filteredTasks
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Week starts from Monday
  const weekStart = new Date(today)
  const dayOfWeek = today.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  weekStart.setDate(today.getDate() - daysToMonday)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  // Month boundaries
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return filteredTasks.filter((task) => {
    const taskDate = new Date(task.createdAt)
    const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
    
    // Also check due date if it exists
    let dueDateMatches = false
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
      
      switch (dateFilter) {
        case "today":
          dueDateMatches = dueDay.getTime() === today.getTime()
          break
        case "tomorrow":
          dueDateMatches = dueDay.getTime() === tomorrow.getTime()
          break
        case "yesterday":
          dueDateMatches = dueDay.getTime() === yesterday.getTime()
          break
        case "week":
          dueDateMatches = dueDay >= weekStart && dueDay <= weekEnd
          break
        case "month":
          dueDateMatches = dueDay >= monthStart && dueDay <= monthEnd
          break
        case "due-today":
          dueDateMatches = dueDay.getTime() === today.getTime()
          break
        case "due-week":
          dueDateMatches = dueDay >= weekStart && dueDay <= weekEnd
          break
        case "overdue":
          dueDateMatches = dueDay < today
          break
      }
    }

    switch (dateFilter) {
      case "today":
        return taskDay.getTime() === today.getTime() || dueDateMatches
      case "tomorrow":
        return taskDay.getTime() === tomorrow.getTime() || dueDateMatches
      case "yesterday":
        return taskDay.getTime() === yesterday.getTime() || dueDateMatches
      case "week":
        return (taskDay >= weekStart && taskDay <= weekEnd) || dueDateMatches
      case "month":
        return (taskDay >= monthStart && taskDay <= monthEnd) || dueDateMatches
      case "due-today":
        return dueDateMatches
      case "due-week":
        return dueDateMatches
      case "overdue":
        return dueDateMatches
      default:
        return true
    }
  })
}
