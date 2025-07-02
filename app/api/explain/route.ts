export async function POST(req: Request) {
  try {
    const { taskTitle } = await req.json()

    if (!taskTitle) {
      return Response.json({ error: "Task title is required" }, { status: 400 })
    }
    
    // Temporary: Hard-code API key for testing
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a helpful productivity assistant. Explain the given task in detail, including:
- What the task involves
- Why it might be important
- Potential steps to complete it
- Any tips or considerations

Keep the explanation concise but informative, around 2-3 sentences.`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nExplain this task: "${taskTitle}"`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 500,
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
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return Response.json({ explanation })
  } catch (error) {
    console.error("AI explanation error:", error)

    // Return fallback explanation
    return Response.json({
      explanation: "This task requires your attention and action to move your goals forward. Breaking it down into smaller steps and setting a timeline can help with completion."
    })
  }
}
