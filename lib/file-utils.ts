import type { Task } from "./types"

export function exportTasks(tasks: Task[]) {
  const dataStr = JSON.stringify(tasks, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement("a")
  link.href = url
  link.download = `smart-todo-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function importTasks(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const tasks = JSON.parse(content)

        // Validate the imported data
        if (!Array.isArray(tasks)) {
          throw new Error("Invalid file format: expected an array of tasks")
        }

        const validatedTasks: Task[] = tasks.map((task, index) => {
          if (!task.id || !task.title || typeof task.completed !== "boolean") {
            throw new Error(`Invalid task at index ${index}`)
          }

          return {
            id: task.id,
            title: task.title,
            completed: task.completed,
            createdAt: task.createdAt || new Date().toISOString(),
            order: task.order ?? index,
          }
        })

        resolve(validatedTasks)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
