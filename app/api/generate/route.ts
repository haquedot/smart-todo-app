export async function POST(req: Request) {
  try {
    const { prompt, existingTasks } = await req.json()

    const existingTaskTitles = existingTasks?.map((t: any) => t.title).join(", ") || ""

    // Temporary: Hard-code API key for testing
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set, using fallback suggestions");
      // Return fallback suggestions instead of throwing
      return Response.json({
        suggestions: [
          "Break down the main goal into smaller steps",
          "Research and gather necessary information",
          "Create a timeline or schedule",
          "Identify required resources or tools",
          "Set up a workspace or environment",
        ],
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a helpful productivity assistant. Generate 3-5 specific, actionable task suggestions based on the user's request. 
      
Rules:
- Each task should be a single, clear action item
- Keep tasks concise (under 50 characters when possible)
- Make tasks specific and actionable
- Avoid duplicating existing tasks: ${existingTaskTitles}
- Return only the task titles, one per line
- No numbering, bullets, or extra formatting`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nGenerate task suggestions for: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error details:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const suggestions = text
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 5)

    return Response.json({ suggestions })
  } catch (error) {
    console.error("AI generation error:", error)

    // Return fallback suggestions
    return Response.json({
      suggestions: [
        "Break down the main goal into smaller steps",
        "Research and gather necessary information",
        "Create a timeline or schedule",
        "Identify required resources or tools",
        "Set up a workspace or environment",
      ],
    })
  }
}
