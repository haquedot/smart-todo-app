export interface Task {
  id: string
  title: string
  explanation?: string // Optional explanation for the task
  completed: boolean
  createdAt: string
  dueDate?: string // Optional due date for the task
  order: number
  userId?: string // Optional user ID for syncing with database
}

export type StatusFilterType = "all" | "active" | "completed"
export type DateFilterType = "all" | "today" | "tomorrow" | "yesterday" | "week" | "month" | "due-today" | "due-week" | "overdue"

export interface TodoState {
  tasks: Task[]
  statusFilter: StatusFilterType
  dateFilter: DateFilterType
  darkMode: boolean
  isAuthenticated: boolean
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
}

export interface TodoActions {
  addTask: (title: string, dueDate?: string, explanation?: string) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  updateTaskExplanation: (id: string, explanation: string) => void
  deleteTask: (id: string) => void
  clearAllTasks: () => Promise<void>
  reorderTasks: (tasks: Task[]) => void
  setStatusFilter: (filter: StatusFilterType) => void
  setDateFilter: (filter: DateFilterType) => void
  toggleDarkMode: () => void
  importTasksFromData: (tasks: Task[]) => void
  syncWithSupabase: (userId: string) => Promise<void>
  setAuthenticated: (isAuthenticated: boolean) => void
  setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error') => void
}

export type TodoStore = TodoState & TodoActions

export interface SyncResult {
  success: boolean
  message: string
  tasksCount?: number
}
