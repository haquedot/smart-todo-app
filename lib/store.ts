import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "./supabase"
import type { TodoStore, Task, StatusFilterType, DateFilterType, SyncResult } from "./types"

// Helper functions for individual task sync
const syncTaskToSupabase = async (task: Task) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { error } = await supabase
      .from('todos')
      .upsert({
        id: task.id,
        user_id: user.id,
        title: task.title,
        explanation: task.explanation || null,
        completed: task.completed,
        created_at: task.createdAt,
        updated_at: new Date().toISOString(),
        due_date: task.dueDate || null
      })
    
    if (error) {
      console.error('Error syncing task to Supabase:', error)
      // Don't throw error for individual sync failures to avoid disrupting UI
    }
  } catch (error) {
    console.error('Task sync failed:', error)
  }
}

const deleteTaskFromSupabase = async (taskId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting task from Supabase:', error)
      // Don't throw error for individual delete failures to avoid disrupting UI
    }
  } catch (error) {
    console.error('Task deletion failed:', error)
  }
}

const clearAllTasksFromSupabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error clearing all tasks from Supabase:', error)
      throw error
    }
  } catch (error) {
    console.error('Clear all tasks failed:', error)
    throw error
  }
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      // State
      tasks: [],
      statusFilter: "all",
      dateFilter: "all",
      darkMode: false,
      isAuthenticated: false,
      syncStatus: 'idle',

      // Actions
      addTask: (title: string, dueDate?: string, explanation?: string) => {
        const newTask: Task = {
          id: uuidv4(),
          title,
          explanation,
          completed: false,
          createdAt: new Date().toISOString(),
          dueDate,
          order: get().tasks.length,
        }
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }))
        
        // Sync with Supabase if authenticated
        const { isAuthenticated } = get()
        if (isAuthenticated) {
          syncTaskToSupabase(newTask).catch(error => {
            console.error('Failed to sync new task:', error)
            // Optionally show a toast notification here
          })
        }
      },

      toggleTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
        }))
        
        // Sync with Supabase if authenticated
        const { isAuthenticated, tasks } = get()
        if (isAuthenticated) {
          const updatedTask = tasks.find(t => t.id === id)
          if (updatedTask) {
            syncTaskToSupabase(updatedTask).catch(error => {
              console.error('Failed to sync task toggle:', error)
            })
          }
        }
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        }))
        
        // Sync with Supabase if authenticated
        const { isAuthenticated, tasks } = get()
        if (isAuthenticated) {
          const updatedTask = tasks.find(t => t.id === id)
          if (updatedTask) {
            syncTaskToSupabase(updatedTask).catch(error => {
              console.error('Failed to sync task update:', error)
            })
          }
        }
      },

      updateTaskExplanation: (id: string, explanation: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, explanation } : task)),
        }))
        
        // Sync with Supabase if authenticated
        const { isAuthenticated, tasks } = get()
        if (isAuthenticated) {
          const updatedTask = tasks.find(t => t.id === id)
          if (updatedTask) {
            syncTaskToSupabase(updatedTask).catch(error => {
              console.error('Failed to sync task explanation:', error)
            })
          }
        }
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
        
        // Delete from Supabase if authenticated
        const { isAuthenticated } = get()
        if (isAuthenticated) {
          deleteTaskFromSupabase(id).catch(error => {
            console.error('Failed to delete task from Supabase:', error)
          })
        }
      },

      clearAllTasks: async () => {
        const { isAuthenticated } = get()
        
        // If authenticated, delete all tasks from Supabase first
        if (isAuthenticated) {
          await clearAllTasksFromSupabase()
        }
        
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

      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated })
      },

      setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error') => {
        set({ syncStatus: status })
      },

      syncWithSupabase: async (userId: string): Promise<void> => {
        try {
          set({ syncStatus: 'syncing' })
          
          // First, check if we can connect to the database
          const { data: healthCheck, error: healthError } = await supabase
            .from('todos')
            .select('count')
            .eq('user_id', userId)
            .limit(1)
          
          if (healthError) {
            console.error('Database health check failed:', healthError)
            // If table doesn't exist, provide helpful error
            if (healthError.code === 'PGRST116' || healthError.message?.includes('relation "todos" does not exist')) {
              throw new Error('Database table not found. Please run the SQL schema from supabase-schema.sql in your Supabase SQL Editor.')
            }
            throw healthError
          }
          
          // Get current local tasks
          const localTasks = get().tasks
          
          // Fetch existing tasks from Supabase
          const { data: remoteTasks, error: fetchError } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
          
          if (fetchError) {
            console.error('Fetch error:', fetchError)
            throw fetchError
          }
          
          // Convert remote tasks to local format
          const remoteTasksLocal: Task[] = (remoteTasks || []).map(task => ({
            id: task.id,
            title: task.title,
            explanation: task.explanation || undefined,
            completed: task.completed,
            createdAt: task.created_at,
            dueDate: task.due_date,
            order: 0, // Will be reordered
            userId: task.user_id
          }))
          
          // Create maps for easier lookup
          const remoteTasksMap = new Map(remoteTasksLocal.map(task => [task.id, task]))
          const localTasksMap = new Map(localTasks.map(task => [task.id, task]))
          
          // Find tasks to sync to remote (new tasks or updated tasks)
          const tasksToSync = localTasks.filter(localTask => {
            const remoteTask = remoteTasksMap.get(localTask.id)
            if (!remoteTask) {
              // New task, needs to be uploaded
              return true
            }
            
            // Check if task has been updated locally
            const localUpdated = new Date(localTask.createdAt).getTime()
            const remoteUpdated = new Date(remoteTask.createdAt).getTime()
            
            // Also check if content differs
            const contentDiffers = 
              localTask.title !== remoteTask.title ||
              localTask.completed !== remoteTask.completed ||
              localTask.explanation !== remoteTask.explanation ||
              localTask.dueDate !== remoteTask.dueDate
            
            return contentDiffers || localUpdated > remoteUpdated
          })
          
          // Sync local tasks to Supabase using upsert
          if (tasksToSync.length > 0) {
            const { error: uploadError } = await supabase
              .from('todos')
              .upsert(
                tasksToSync.map(task => ({
                  id: task.id,
                  user_id: userId,
                  title: task.title,
                  explanation: task.explanation || null,
                  completed: task.completed,
                  created_at: task.createdAt,
                  updated_at: new Date().toISOString(),
                  due_date: task.dueDate || null
                })),
                { 
                  onConflict: 'id',
                  ignoreDuplicates: false 
                }
              )
            
            if (uploadError) {
              console.error('Upload error:', uploadError)
              throw uploadError
            }
          }
          
          // After successful upload, re-fetch to get the latest state
          const { data: updatedRemoteTasks, error: refetchError } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
          
          if (refetchError) {
            console.error('Refetch error:', refetchError)
            throw refetchError
          }
          
          // Convert updated remote tasks to local format
          const finalRemoteTasks: Task[] = (updatedRemoteTasks || []).map(task => ({
            id: task.id,
            title: task.title,
            explanation: task.explanation || undefined,
            completed: task.completed,
            createdAt: task.created_at,
            dueDate: task.due_date,
            order: 0, // Will be reordered
            userId: task.user_id
          }))
          
          // Merge strategy: prefer local tasks for any that exist locally, add remote-only tasks
          const localTaskIds = new Set(localTasks.map(t => t.id))
          const remoteOnlyTasks = finalRemoteTasks.filter(task => !localTaskIds.has(task.id))
          
          // Combine local tasks (which are authoritative for tasks that exist locally) with remote-only tasks
          const mergedTasks = [...localTasks, ...remoteOnlyTasks]
            .map((task, index) => ({ ...task, order: index }))
          
          set({ 
            tasks: mergedTasks,
            syncStatus: 'success'
          })
          
        } catch (error) {
          console.error('Sync error:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          set({ syncStatus: 'error' })
          throw error
        }
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
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
    },
  ),
)
