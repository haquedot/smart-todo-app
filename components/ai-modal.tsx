"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Plus, Loader2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTodoStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { generateTaskSuggestions } from "@/lib/ai"

interface AIModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AIModal({ isOpen, onClose }: AIModalProps) {
  const [prompt, setPrompt] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set())
  const { addTask, tasks } = useTodoStore()
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const newSuggestions = await generateTaskSuggestions(prompt, tasks)
      setSuggestions(newSuggestions)
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSuggestion = (suggestion: string) => {
    // Add AI-generated tasks with today's date as default
    const today = new Date().toISOString()
    addTask(suggestion, today)
    toast({
      title: "Task added",
      description: "AI suggestion added to your tasks.",
    })
    
    // Mark task as added for animation
    setAddedTasks(prev => new Set([...prev, suggestion]))
    
    // Remove the added suggestion from the list after a short delay
    setTimeout(() => {
      setSuggestions(prev => prev.filter(s => s !== suggestion))
    }, 500)
  }

  // Auto-close modal when all suggestions are added
  useEffect(() => {
    if (suggestions.length === 0 && isOpen && !isLoading && prompt.trim() && addedTasks.size > 0) {
      // Small delay to let user see the last task being added
      const timer = setTimeout(() => {
        handleClose()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [suggestions.length, isOpen, isLoading, prompt, addedTasks.size])

  const handleClose = () => {
    setPrompt("")
    setSuggestions([])
    setAddedTasks(new Set())
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-lg">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg pr-8">
            <div className="p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-lg">
              <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            AI Task Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Describe what you need to accomplish:
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I need to prepare for a job interview, plan a birthday party, or organize my home office..."
                className="min-h-[100px] bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-300/50 dark:border-purple-700/50 focus:border-purple-500 dark:focus:border-purple-400 resize-none"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!prompt.trim() || isLoading} 
              className="w-full h-11 gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Tasks
                </>
              )}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="relative">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                <Sparkles className="w-4 h-4 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
                AI is creating personalized tasks for you...
              </span>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && suggestions.length === 0 && prompt.trim() === "" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Task Generation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm px-4">
                Describe your goal or project, and I'll break it down into actionable tasks for you.
              </p>
            </div>
          )}

          {/* Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/30 dark:border-emerald-700/30">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Suggested Tasks
                  </h3>
                  {addedTasks.size > 0 && (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">
                      {addedTasks.size} added
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => {
                    const isAdded = addedTasks.has(suggestion)
                    return (
                      <motion.div
                        key={suggestion}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: isAdded ? 0.7 : 1, 
                          x: 0,
                          scale: isAdded ? 0.98 : 1
                        }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                          isAdded 
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800" 
                            : "bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium transition-colors ${
                            isAdded 
                              ? "text-emerald-700 dark:text-emerald-300 line-through" 
                              : "text-gray-900 dark:text-white"
                          }`}>
                            {suggestion}
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={isAdded ? "secondary" : "default"}
                          onClick={() => handleAddSuggestion(suggestion)}
                          disabled={isAdded}
                          className={`gap-2 h-9 px-4 transition-all ${
                            isAdded
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                              : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3 h-3 rounded-full bg-emerald-500"
                              />
                              <span className="text-xs font-medium">Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span className="text-xs font-medium">Add</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="w-full h-11"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
