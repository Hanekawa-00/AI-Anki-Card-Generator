import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCardData } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

export const generateFlashcards = async (
  topic: string,
  count: number,
  context: string = ""
): Promise<GeneratedCardData[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert educational content creator.
    Create ${count} high-quality Anki flashcards about the following topic: "${topic}".
    ${context ? `Additional Context/Source Material: ${context}` : ""}

    Rules:
    1. Keep the 'front' concise (a question, key term, or concept).
    2. Make the 'back' explanatory but structured.
    3. USE SEMANTIC HTML. The system has custom CSS for:
       - <strong>: for keywords (colors blue).
       - <em>: for emphasis/warnings (colors pink with background).
       - <ul> and <li>: for lists (custom arrow bullets).
       - <code>: for code/terms (monospaced red).
    4. PREFER using <ul> lists for breaking down complex answers.
    5. Add relevant tags (lowercase, no spaces).
    6. Return strictly a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "The question or term (HTML allowed)" },
              back: { type: Type.STRING, description: "The answer or explanation (HTML allowed)" },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Relevant tags for the card"
              },
            },
            required: ["front", "back", "tags"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as GeneratedCardData[];
    return data;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate flashcards using Gemini.");
  }
};
