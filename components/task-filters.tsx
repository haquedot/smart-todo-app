"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CheckCircle, List, Sun, Clock3, Clock4, CalendarDays, CalendarRange, AlertTriangle, Target } from "lucide-react"
import type { StatusFilterType, DateFilterType } from "@/lib/types"

interface TaskFiltersProps {
  currentStatusFilter: StatusFilterType
  currentDateFilter: DateFilterType
  onStatusFilterChange: (filter: StatusFilterType) => void
  onDateFilterChange: (filter: DateFilterType) => void
}

export function TaskFilters({ 
  currentStatusFilter, 
  currentDateFilter, 
  onStatusFilterChange, 
  onDateFilterChange 
}: TaskFiltersProps) {
  const statusFilters: { key: StatusFilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <List className="w-3 h-3" /> },
    { key: "active", label: "Active", icon: <Clock className="w-3 h-3" /> },
    { key: "completed", label: "Done", icon: <CheckCircle className="w-3 h-3" /> },
  ]

  const dateFilters: { key: DateFilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All Time", icon: <Calendar className="w-3 h-3" /> },
    { key: "today", label: "Today", icon: <Sun className="w-3 h-3" /> },
    { key: "tomorrow", label: "Tomorrow", icon: <Clock3 className="w-3 h-3" /> },
    { key: "yesterday", label: "Yesterday", icon: <Clock4 className="w-3 h-3" /> },
    { key: "week", label: "Week", icon: <CalendarDays className="w-3 h-3" /> },
    { key: "month", label: "Month", icon: <CalendarRange className="w-3 h-3" /> },
  ]

  return (
    <motion.div
      className="mb-3 space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Status Filters */}
      <div className="flex gap-1 p-1 bg-gray-100/90 dark:bg-gray-700/90 rounded-xl border border-gray-200/60 dark:border-gray-600/60 backdrop-blur-sm">
        {statusFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="ghost"
            size="sm"
            onClick={() => onStatusFilterChange(filter.key)}
            className={`
              flex-1 gap-2 transition-all duration-300 font-medium relative
              ${
                currentStatusFilter === filter.key
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-600/60"
              }
            `}
          >
            {filter.icon}
            {filter.label}
            {currentStatusFilter === filter.key && (
              <motion.div
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg shadow-md -z-10"
                layoutId="statusFilter"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Button>
        ))}
      </div>

      {/* Date Filters */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {dateFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="ghost"
            size="sm"
            onClick={() => onDateFilterChange(filter.key)}
            className={`
              gap-1 transition-all duration-300 text-xs font-medium relative
              ${
                currentDateFilter === filter.key
                  ? "bg-purple-500 text-white shadow-md hover:bg-purple-600"
                  : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 bg-white/70 dark:bg-gray-800/70 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm"
              }
            `}
          >
            {filter.icon}
            {filter.label}
          </Button>
        ))}
      </div>
    </motion.div>
  )
}
