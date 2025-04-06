import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslationProvider } from "../types.js";

export class GeminiTranslationProvider implements TranslationProvider {
  private ai: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-2.0-flash") {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    this.ai = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  /**
   * Translates strings using Gemini AI
   */
  async translateStrings(
    strings: Record<string, string>,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<Record<string, string>> {
    if (Object.keys(strings).length === 0) {
      return {};
    }

    try {
      // Create model instance
      const model = this.ai.getGenerativeModel({ model: this.model });

      // Create prompt with structured instructions
      const prompt = `Translate the following JSON strings from ${sourceLanguage} to ${targetLanguage}. 
      Only translate the string values, keep the keys exactly the same.
      Return the result as a valid JSON object with the same structure.
      
      ${JSON.stringify(strings, null, 2)}`;

      // Generate content
      const response = await model.generateContent(prompt);
      const result = response.response;
      const textResult = result.text();

      // Try to parse the response as JSON
      try {
        const translations = JSON.parse(textResult) as Record<string, string>;

        // Validate the response has all the keys
        for (const key of Object.keys(strings)) {
          if (!translations[key]) {
            translations[key] = strings[key]; // Fallback to original if translation is missing
          }
        }

        return translations;
      } catch (parseError) {
        // If parsing fails, try to extract JSON from the text (in case model wrapped the JSON)
        const jsonMatch = textResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]) as Record<string, string>;
          } catch {
            throw new Error("Failed to parse translation response");
          }
        }
        throw new Error("Failed to parse translation response");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini translation failed: ${error.message}`);
      }
      throw error;
    }
  }
}
