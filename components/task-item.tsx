"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, GripVertical, Edit2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskExplanationModal } from "@/components/task-explanation-modal"
import { useTodoStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/types"

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.title)
  const [showExplanationModal, setShowExplanationModal] = useState(false)
  const { toggleTask, updateTask, deleteTask } = useTodoStore()
  const { toast } = useToast()

  const handleToggle = () => {
    toggleTask(task.id)
    toast({
      title: task.completed ? "Task reactivated" : "Task completed",
      description: task.completed ? "Task marked as active" : "Great job! Task completed.",
    })
  }

  const handleEdit = () => {
    if (isEditing) {
      if (editText.trim() && editText !== task.title) {
        updateTask(task.id, { title: editText.trim() })
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        })
      } else {
        setEditText(task.title)
      }
    }
    setIsEditing(!isEditing)
  }

  const handleDelete = () => {
    deleteTask(task.id)
    toast({
      title: "Task deleted",
      description: "Task has been removed from your list.",
    })
  }

  const handleExplain = () => {
    setShowExplanationModal(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit()
    } else if (e.key === "Escape") {
      setEditText(task.title)
      setIsEditing(false)
    }
  }

  return (
    <motion.div
      className={`
        group flex items-center gap-3 p-4 rounded-lg border transition-all duration-300
        ${
          task.completed
            ? "bg-gradient-to-r from-gray-50/80 via-slate-50/80 to-gray-50/80 dark:from-gray-700/50 dark:via-slate-700/50 dark:to-gray-700/50 border-gray-200/60 dark:border-gray-600/60"
            : "bg-gradient-to-r from-white/90 via-blue-50/30 to-white/90 dark:from-gray-800/90 dark:via-blue-900/20 dark:to-gray-800/90 border-blue-200/40 dark:border-blue-700/40 hover:from-blue-50/60 hover:via-indigo-50/40 hover:to-blue-50/60 dark:hover:from-blue-900/30 dark:hover:via-indigo-900/20 dark:hover:to-blue-900/30 hover:border-blue-400/60 dark:hover:border-blue-500/60"
        }
        hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 backdrop-blur-sm
      `}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Drag Handle */}
      <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Checkbox */}
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500 data-[state=checked]:border-emerald-500 hover:border-emerald-400 transition-all duration-200"
      />

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleEdit}
            className="h-8 text-sm"
            autoFocus
          />
        ) : (
          <motion.span
            className={`
              block text-sm transition-all duration-200
              ${task.completed ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-900 dark:text-white"}
            `}
            layout
          >
            {task.title}
          </motion.span>
        )}

        <div className="text-xs text-gray-400 mt-1">{new Date(task.createdAt).toLocaleDateString()}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExplain}
          className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20"
          title="Explain with AI"
        >
          <Sparkles className="w-3 h-3" />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleEdit} 
          className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20"
        >
          {isEditing ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:from-red-900/20 dark:hover:to-pink-900/20"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Task Explanation Modal */}
      <TaskExplanationModal
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
        taskTitle={task.title}
      />
    </motion.div>
  )
}
