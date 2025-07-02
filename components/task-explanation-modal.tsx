"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TaskExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
}

export function TaskExplanationModal({ isOpen, onClose, taskTitle }: TaskExplanationModalProps) {
  const [explanation, setExplanation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchExplanation = async () => {
    if (!taskTitle) return

    setIsLoading(true)
    setError("")
    setExplanation("")

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskTitle }),
      })

      if (!response.ok) {
        throw new Error("Failed to get explanation")
      }

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (error) {
      console.error("Error fetching explanation:", error)
      setError("Failed to get AI explanation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch explanation when modal opens
  useEffect(() => {
    if (isOpen && taskTitle && !explanation && !isLoading) {
      fetchExplanation()
    }
  }, [isOpen, taskTitle])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Task Explanation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-1">Task:</h3>
            <p className="text-gray-900 dark:text-white">{taskTitle}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300">AI Explanation:</h3>
            
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Generating explanation...</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchExplanation}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

            {explanation && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{explanation}</p>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
