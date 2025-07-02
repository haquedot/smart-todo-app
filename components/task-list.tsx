"use client"

import { useState } from "react"
import { motion, Reorder, AnimatePresence } from "framer-motion"
import { TaskItem } from "./task-item"
import { useTodoStore } from "@/lib/store"
import type { Task } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const { reorderTasks } = useTodoStore()
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const handleReorder = (newOrder: Task[]) => {
    // Update the order property based on new positions
    const reorderedTasks = newOrder.map((task, index) => ({
      ...task,
      order: index,
    }))
    reorderTasks(reorderedTasks)
  }

  return (
    <div className="space-y-2">
      <Reorder.Group axis="y" values={tasks} onReorder={handleReorder} className="space-y-2">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <Reorder.Item
              key={task.id}
              value={task}
              className="cursor-default"
              onDragStart={() => setDraggedTask(task.id)}
              onDragEnd={() => setDraggedTask(null)}
            >
              <motion.div
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  zIndex: draggedTask === task.id ? 10 : 1,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                  scale: 0.9,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  layout: { duration: 0.2 },
                }}
                whileHover={{ scale: 1.02 }}
                className={`${draggedTask === task.id ? "shadow-lg rotate-2" : ""}`}
              >
                <TaskItem task={task} />
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  )
}
