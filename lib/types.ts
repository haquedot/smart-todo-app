export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
  order: number
}

export type StatusFilterType = "all" | "active" | "completed"
export type DateFilterType = "all" | "today" | "tomorrow" | "yesterday" | "week" | "month"

export interface TodoState {
  tasks: Task[]
  statusFilter: StatusFilterType
  dateFilter: DateFilterType
  darkMode: boolean
}

export interface TodoActions {
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  clearAllTasks: () => void
  reorderTasks: (tasks: Task[]) => void
  setStatusFilter: (filter: StatusFilterType) => void
  setDateFilter: (filter: DateFilterType) => void
  toggleDarkMode: () => void
  importTasksFromData: (tasks: Task[]) => void
}

export type TodoStore = TodoState & TodoActions
