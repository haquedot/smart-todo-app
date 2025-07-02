"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Loader2, Save, Check, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface TaskExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
}

export function TaskExplanationModal({ isOpen, onClose, taskTitle }: TaskExplanationModalProps) {
  const [explanation, setExplanation] = useState("")
  const [savedExplanation, setSavedExplanation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const { toast } = useToast()

  // Generate storage key for this task
  const storageKey = `task-explanation-${taskTitle.toLowerCase().replace(/\s+/g, '-')}`

  // Load saved explanation on mount
  useEffect(() => {
    if (isOpen && taskTitle) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setSavedExplanation(saved)
        setExplanation(saved)
        setIsSaved(true)
        setError("") // Clear any previous errors
      } else {
        setSavedExplanation("")
        setExplanation("")
        setIsSaved(false)
      }
    }
  }, [isOpen, taskTitle, storageKey])

  const fetchExplanation = async () => {
    if (!taskTitle) return

    setIsLoading(true)
    setError("")

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

  const handleSave = () => {
    if (explanation.trim()) {
      localStorage.setItem(storageKey, explanation)
      setSavedExplanation(explanation)
      setIsSaved(true)
      setJustSaved(true)
      
      toast({
        title: "Explanation saved",
        description: "The AI explanation has been saved for this task.",
      })

      // Reset the "just saved" state after animation
      setTimeout(() => setJustSaved(false), 2000)
    }
  }

  const handleDelete = () => {
    localStorage.removeItem(storageKey)
    setSavedExplanation("")
    setExplanation("")
    setIsSaved(false)
    
    toast({
      title: "Explanation deleted",
      description: "The saved explanation has been removed.",
    })
  }

  // Fetch explanation when modal opens and no saved explanation exists
  useEffect(() => {
    if (isOpen && taskTitle && !savedExplanation && !explanation && !isLoading && !error) {
      fetchExplanation()
    }
  }, [isOpen, taskTitle, savedExplanation, explanation, isLoading, error])

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError("")
      setJustSaved(false)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-lg">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg pr-8">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Task Explanation
            {isSaved && (
              <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Task Title */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-1">Task:</h3>
            <p className="text-gray-900 dark:text-white text-sm sm:text-base break-words">{taskTitle}</p>
          </div>

          {/* AI Explanation Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300">AI Explanation:</h3>
              {explanation && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchExplanation}
                  disabled={isLoading}
                  className="h-8 px-3 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {isSaved ? "Explain Again" : "Regenerate"}
                </Button>
              )}
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                <span className="text-gray-600 dark:text-gray-300 text-sm text-center">Generating explanation...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchExplanation}
                  className="w-full sm:w-auto h-10"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Explanation Content */}
            {explanation && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  isSaved 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" 
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                {isSaved && (
                  <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium">Saved Explanation</span>
                  </div>
                )}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                  {explanation}
                </p>
              </motion.div>
            )}

            {/* Empty State */}
            {!explanation && !isLoading && !error && (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🤔</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 px-4">
                  Click "Generate" to get an AI explanation for this task.
                </p>
                <Button
                  onClick={fetchExplanation}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-10 px-6"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Explanation
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {explanation && (
            <div className="flex flex-col sm:flex-row gap-2">
              {!isSaved || explanation !== savedExplanation ? (
                <Button
                  onClick={handleSave}
                  disabled={!explanation.trim()}
                  className={`gap-2 w-full h-11 sm:h-10 ${
                    justSaved
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  } text-white`}
                  size="sm"
                >
                  {justSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Explanation
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="w-full gap-2 h-11 sm:h-10 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                  Delete Saved
                </Button>
              )}
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={onClose}
            className="h-11 sm:h-10"
            size="sm"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
