"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Moon, Sun, Sparkles, Download, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { TaskList } from "@/components/task-list"
import { TaskFilters } from "@/components/task-filters"
import { AIModal } from "@/components/ai-modal"
import { DatePicker } from "@/components/date-picker"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useTodoStore } from "@/lib/store"
import { exportTasks, importTasks } from "@/lib/file-utils"
import { getFilteredTasks } from "@/lib/date-utils"
import type { StatusFilterType, DateFilterType } from "@/lib/types"

export default function TodoApp() {
  const [newTask, setNewTask] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()) // Default to today
  const [showAIModal, setShowAIModal] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

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
    importTasksFromData
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

  const handleClearAll = () => {
    clearAllTasks()
    setShowClearDialog(false)
    toast({
      title: "All tasks cleared",
      description: "All tasks have been removed.",
    })
  }

  const filteredTasks = getFilteredTasks(tasks, statusFilter, dateFilter)

  const activeCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/30 transition-all duration-700 ease-in-out">
      <div className="container mx-auto p-4 md:py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-2 md:p-6 mb-6 transition-all duration-700 ease-in-out"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
            <motion.h1
              className="text-lg md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ✨ Smart Todo
            </motion.h1>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIModal(true)}
                className="gap-1 sm:gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 border-purple-300/50 dark:border-purple-700/50 hover:from-purple-500/20 hover:to-pink-500/20 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 px-2 sm:px-3"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">AI</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-600/20 dark:to-indigo-600/20 border-blue-300/50 dark:border-blue-700/50 hover:from-blue-500/20 hover:to-indigo-500/20 dark:hover:from-blue-600/30 dark:hover:to-indigo-600/30 px-2 sm:px-3"
              >
                {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
              </Button>
            </div>
          </div>

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
            className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50 dark:from-blue-700/50 dark:via-purple-700/50 dark:to-pink-700/50"
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
              {(statusFilter !== "all" || dateFilter !== "all") && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {filteredTasks.length} {statusFilter === "active" ? "active" : statusFilter === "completed" ? "completed" : "tasks"}
                  {dateFilter === "due-today" && " due today"}
                  {dateFilter === "due-week" && " due this week"}
                  {dateFilter === "overdue" && " overdue"}
                  {dateFilter !== "all" && !["due-today", "due-week", "overdue"].includes(dateFilter) && ` in ${dateFilter.replace("-", " ")}`}
                </div>
              )}
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
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAll}
        title="Clear all tasks?"
        description="This action cannot be undone. All tasks will be permanently deleted."
      />
    </div>
  )
}
