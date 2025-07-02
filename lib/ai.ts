import type { Task } from "./types"

export async function generateTaskSuggestions(prompt: string, existingTasks: Task[]): Promise<string[]> {
  try {
    // Use the API route instead of direct Gemini calls
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        existingTasks
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error details:", errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("AI generation error:", error)
    // Fallback suggestions
    return [
      "Break down the main goal into smaller steps",
      "Research and gather necessary information",
      "Create a timeline or schedule",
      "Identify required resources or tools",
      "Set up a workspace or environment",
    ]
  }
}
