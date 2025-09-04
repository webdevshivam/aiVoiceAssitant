import { GoogleGenAI } from "@google/genai";

export async function generateSalesResponse(
  userMessage: string,
  salesPrompt: string,
  apiKey?: string
): Promise<string> {
  try {
    const key = apiKey || process.env.GEMINI_API_KEY || "";
    
    if (!key) {
      throw new Error("Gemini API key is required. Please provide an API key in settings or set GEMINI_API_KEY environment variable.");
    }

    const ai = new GoogleGenAI({ apiKey: key });

    const systemPrompt = `You are an expert AI sales assistant. Your role is to engage customers in natural, persuasive conversations to sell products or services.

Instructions:
- ${salesPrompt}
- Be friendly, professional, and persuasive
- Listen to customer needs and address them directly
- Handle objections gracefully and provide compelling responses
- Ask engaging questions to understand customer requirements
- Use sales techniques like creating urgency, highlighting benefits, and building value
- Keep responses conversational and natural (2-4 sentences typically)
- Always aim to move the conversation toward a sale
- Be authentic and build trust with the customer

Remember: You are a real salesperson having a genuine conversation. Make it feel natural and engaging.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: userMessage,
    });

    const aiResponse = response.text;
    
    if (!aiResponse) {
      throw new Error("No response generated from Gemini API");
    }

    return aiResponse.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid or missing API key. Please check your Gemini API key in settings.");
      }
      if (error.message.includes("quota") || error.message.includes("billing")) {
        throw new Error("API quota exceeded or billing issue. Please check your Gemini API account.");
      }
      if (error.message.includes("permission")) {
        throw new Error("API permission denied. Please ensure your Gemini API key has the correct permissions.");
      }
      throw new Error(`AI service error: ${error.message}`);
    }
    
    throw new Error("Failed to generate AI response. Please try again or check your API configuration.");
  }
}
