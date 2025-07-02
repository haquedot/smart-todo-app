import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"
import type { TodoStore, Task, StatusFilterType, DateFilterType } from "./types"

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      // State
      tasks: [],
      statusFilter: "all",
      dateFilter: "all",
      darkMode: false,

      // Actions
      addTask: (title: string) => {
        const newTask: Task = {
          id: uuidv4(),
          title,
          completed: false,
          createdAt: new Date().toISOString(),
          order: get().tasks.length,
        }
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }))
      },

      toggleTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
        }))
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        }))
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },

      clearAllTasks: () => {
        set({ tasks: [] })
      },

      reorderTasks: (reorderedTasks: Task[]) => {
        set({ tasks: reorderedTasks })
      },

      setStatusFilter: (statusFilter: StatusFilterType) => {
        set({ statusFilter })
      },

      setDateFilter: (dateFilter: DateFilterType) => {
        set({ dateFilter })
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }))
      },

      importTasksFromData: (importedTasks: Task[]) => {
        // Validate and merge with existing tasks
        const validTasks = importedTasks.filter((task) => task.id && task.title && typeof task.completed === "boolean")

        const existingIds = new Set(get().tasks.map((t) => t.id))
        const newTasks = validTasks.filter((task) => !existingIds.has(task.id))

        set((state) => ({
          tasks: [...state.tasks, ...newTasks],
        }))
      },
    }),
    {
      name: "smart-todo-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        statusFilter: state.statusFilter,
        dateFilter: state.dateFilter,
        darkMode: state.darkMode,
      }),
      skipHydration: true,
    },
  ),
)
