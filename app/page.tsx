"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Moon, Sun, Sparkles, Download, Upload, Trash2, User, LogOut, Cloud, CloudOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { TaskList } from "@/components/task-list"
import { TaskFilters } from "@/components/task-filters"
import { AIModal } from "@/components/ai-modal"
import { DatePicker } from "@/components/date-picker"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { UserProfile } from "@/components/user-profile"
import { SyncIndicator } from "@/components/sync-indicator"
import { DatabaseSetupChecker } from "@/components/database-setup-checker"
import { useAuth } from "@/lib/auth"
import { useTodoStore } from "@/lib/store"
import { exportTasks, importTasks } from "@/lib/file-utils"
import { getFilteredTasks } from "@/lib/date-utils"
import type { StatusFilterType, DateFilterType } from "@/lib/types"

export default function TodoApp() {
  const [newTask, setNewTask] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()) // Default to today
  const [showAIModal, setShowAIModal] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isClearingTasks, setIsClearingTasks] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()

  const {
    tasks,
    statusFilter,
    dateFilter,
    darkMode,
    addTask,
    clearAllTasks,
    toggleDarkMode,
    setStatusFilter,
    setDateFilter,
    importTasksFromData,
    syncWithSupabase,
    setAuthenticated,
    clearLocalData,
    syncStatus
  } = useTodoStore()

  useEffect(() => {
    setMounted(true)
    // Rehydrate the store after mounting
    useTodoStore.persist.rehydrate()
    // Prevent transition flash during hydration
    document.documentElement.classList.add('no-transition')
    setTimeout(() => {
      document.documentElement.classList.remove('no-transition')
    }, 100)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", darkMode)
    }
  }, [darkMode, mounted])

  // Handle authentication state changes
  useEffect(() => {
    if (!authLoading && user) {
      setAuthenticated(true)
      // Auto-sync when user logs in
      syncWithSupabase(user.id).catch(error => {
        console.error('Auto-sync failed:', error)
        console.error('Auto-sync error details:', JSON.stringify(error, null, 2))
        toast({
          title: "Sync failed",
          description: "Failed to sync your tasks automatically. You can try manual sync.",
          variant: "destructive",
        })
      })
    } else if (!authLoading && !user) {
      setAuthenticated(false)
    }
  }, [user, authLoading, setAuthenticated, syncWithSupabase, toast])

  const handleAddTask = () => {
    if (newTask.trim()) {
      const dueDate = selectedDate ? selectedDate.toISOString() : undefined
      addTask(newTask.trim(), dueDate)
      setNewTask("")
      // Reset to today for next task
      setSelectedDate(new Date())
      toast({
        title: "Task added",
        description: "Your new task has been added successfully.",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask()
    }
  }

  const handleExport = () => {
    exportTasks(tasks)
    toast({
      title: "Tasks exported",
      description: "Your tasks have been exported as JSON.",
    })
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const importedTasks = await importTasks(file)
        importTasksFromData(importedTasks)
        toast({
          title: "Tasks imported",
          description: `${importedTasks.length} tasks imported successfully.`,
        })
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import tasks. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    // Reset the input
    event.target.value = ""
  }

  const handleClearAll = async () => {
    try {
      setIsClearingTasks(true)
      await clearAllTasks()
      setShowClearDialog(false)
      toast({
        title: "All tasks cleared",
        description: "All tasks have been removed from your account.",
      })
    } catch (error) {
      toast({
        title: "Clear failed",
        description: "Failed to clear all tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClearingTasks(false)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      // Clear all local data when user logs out
      clearLocalData()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out and local data cleared.",
      })
    } catch (error) {
      toast({
        title: "Sign-out failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSync = async () => {
    if (!user) return

    try {
      await syncWithSupabase(user.id)
      toast({
        title: "Sync completed",
        description: "Your tasks have been synced with the cloud.",
      })
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync your tasks. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return user ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />
    }
  }

  const filteredTasks = getFilteredTasks(tasks, statusFilter, dateFilter)

  const activeCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/30 transition-all duration-700 ease-in-out">
      <div className="container mx-auto p-4 md:py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          className="mb-3 p-4 sm:p-6 bg-gradient-to-r from-white/60 via-blue-50/40 to-purple-50/40 dark:from-gray-800/60 dark:via-blue-900/30 dark:to-purple-900/30 rounded-2xl border border-white/50 dark:border-gray-700/50 backdrop-blur-sm shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Logo & Title */}
            <motion.div
              className="flex items-center gap-3 flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent leading-tight">
                  Smart Todo
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  AI-powered task management
                </p>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex items-center gap-2 flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Google Auth */}
              {!user ? (
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  size="sm"
                  data-testid="sign-in-button"
                  className="gap-2 bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-200 px-3 py-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden sm:inline text-sm">Sign In</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSync}
                    variant="outline"
                    size="sm"
                    disabled={syncStatus === 'syncing'}
                    className="gap-2 bg-white/80 dark:bg-gray-800/80 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-all duration-200 px-3 py-2"
                  >
                    {getSyncIcon()}
                    <span className="hidden sm:inline text-sm">
                      {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                    </span>
                  </Button>

                  <Avatar className="w-8 h-8 border-2 border-white/50 dark:border-gray-600/50">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    disabled={isLoggingOut}
                    className="gap-2 bg-white/80 dark:bg-gray-800/80 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 px-3 py-2"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline text-sm">Sign Out</span>
                  </Button>
                </div>
              )}

              {/* AI Assistant */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIModal(true)}
                className="gap-2 bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-all duration-200 px-3 py-2"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">AI Assistant</span>
                <span className="sm:hidden text-sm">AI</span>
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 transition-all duration-200 px-3 py-2"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-4 md:p-8 mb-3 transition-all duration-700 ease-in-out"
        >

          {/* Database Setup Checker */}
          {/* <DatabaseSetupChecker /> */}

          {/* Task Input */}
          <motion.div
            className="flex flex-col gap-3 mb-3 p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/50 to-cyan-50/50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-emerald-200/30 dark:border-emerald-700/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                type="text"
                placeholder="What needs to be done?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-emerald-300/50 dark:border-emerald-700/50 focus:border-emerald-500 dark:focus:border-emerald-400"
              />
              <Button
                onClick={handleAddTask}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 md:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <DatePicker
                date={selectedDate}
                onDateChange={(date) => setSelectedDate(date || new Date())}
                placeholder="Select due date"
                className="md:min-w-[200px]"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left flex-1">
                📅 Due date for new task (defaults to today)
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <TaskFilters
            currentStatusFilter={statusFilter}
            currentDateFilter={dateFilter}
            onStatusFilterChange={setStatusFilter}
            onDateFilterChange={setDateFilter}
          />

          {/* Task List */}
          <TaskList tasks={filteredTasks} />

          {/* Footer Actions */}
          <motion.div
            className="flex flex-wrap gap-2 mt-3 pt-6 border-t border-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50 dark:from-blue-700/50 dark:via-purple-700/50 dark:to-pink-700/50 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-1 sm:gap-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-300/50 dark:border-blue-700/50 hover:from-blue-100/70 hover:to-indigo-100/70 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1 sm:gap-2 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-300/50 dark:border-emerald-700/50 hover:from-emerald-100/70 hover:to-teal-100/70 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 flex-1 sm:flex-none"
            >
              <label htmlFor="import-file" className="cursor-pointer flex items-center gap-1 sm:gap-2">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Import</span>
              </label>
            </Button>
            <input id="import-file" type="file" accept=".json" onChange={handleImport} className="hidden" />

            {tasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="gap-1 sm:gap-2 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-900/30 dark:to-pink-900/30 border-red-300/50 dark:border-red-700/50 hover:from-red-100/70 hover:to-pink-100/70 dark:hover:from-red-900/50 dark:hover:to-pink-900/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
              </Button>
            )}
          </motion.div>

          {/* Task Stats */}
          {tasks.length > 0 && (
            <motion.div
              className="text-center text-sm mt-4 space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-gradient-to-r from-gray-500 via-blue-500 to-purple-500 dark:from-gray-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-medium">
                {activeCount} active • {completedCount} completed
              </div>
              <div className="flex items-center justify-center gap-2">
                <SyncIndicator />
                {(statusFilter !== "all" || dateFilter !== "all") && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {filteredTasks.length} {statusFilter === "active" ? "active" : statusFilter === "completed" ? "completed" : "tasks"}
                    {dateFilter === "due-today" && " due today"}
                    {dateFilter === "due-week" && " due this week"}
                    {dateFilter === "overdue" && " overdue"}
                    {dateFilter !== "all" && !["due-today", "due-week", "overdue"].includes(dateFilter) && ` in ${dateFilter.replace("-", " ")}`}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50 transition-all duration-700 ease-in-out"
            >
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-600 via-blue-600 to-purple-600 dark:from-gray-300 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                {statusFilter === "active"
                  ? "No active tasks"
                  : statusFilter === "completed"
                    ? "No completed tasks"
                    : dateFilter === "today"
                      ? "No tasks for today"
                      : dateFilter === "tomorrow"
                        ? "No tasks for tomorrow"
                        : dateFilter === "yesterday"
                          ? "No tasks from yesterday"
                          : dateFilter === "week"
                            ? "No tasks this week"
                            : dateFilter === "month"
                              ? "No tasks this month"
                              : dateFilter === "due-today"
                                ? "No tasks due today"
                                : dateFilter === "due-week"
                                  ? "No tasks due this week"
                                  : dateFilter === "overdue"
                                    ? "No overdue tasks"
                                    : "No tasks yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {statusFilter === "all" && dateFilter === "all"
                  ? "Add your first task to get started!"
                  : dateFilter === "today"
                    ? "Create a task for today to stay productive!"
                    : dateFilter === "tomorrow"
                      ? "Plan ahead by adding tasks for tomorrow."
                      : dateFilter === "yesterday"
                        ? "No tasks were created yesterday."
                        : dateFilter === "week"
                          ? "No tasks created this week."
                          : dateFilter === "month"
                            ? "No tasks created this month."
                            : dateFilter === "due-today"
                              ? "Great! You're all caught up for today."
                              : dateFilter === "due-week"
                                ? "No tasks are due this week."
                                : dateFilter === "overdue"
                                  ? "Excellent! No overdue tasks."
                                  : `Switch to "All" to see your ${statusFilter === "active" ? "completed" : "active"} tasks.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AIModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />

      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => !isClearingTasks && setShowClearDialog(false)}
        onConfirm={handleClearAll}
        title="Clear all tasks?"
        description="This action cannot be undone. All tasks will be permanently deleted from your account and synced devices."
        confirmText={isClearingTasks ? "Clearing..." : "Clear All"}
        isLoading={isClearingTasks}
      />
    </div>
  )
}
