import { TranslationProvider } from "../types.js";
import { GeminiTranslationProvider } from "./gemini-provider.js";

export type ProviderType = "gemini";

export class TranslationProviderFactory {
  /**
   * Creates a translation provider based on the specified type
   */
  static createProvider(
    type: ProviderType,
    apiKey: string
  ): TranslationProvider {
    switch (type) {
      case "gemini":
        return new GeminiTranslationProvider(apiKey);
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }
}
