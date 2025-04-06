import fs from "fs-extra";
import path from "path";
import { JsonObject, JsonValue } from "./types.js";

/**
 * Reads and parses a JSON file
 */
export async function readJsonFile(filePath: string): Promise<JsonObject> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as JsonObject;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Writes a JSON object to a file
 */
export async function writeJsonFile(
  filePath: string,
  data: JsonObject
): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to write JSON file ${filePath}: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Extracts all string values from a JSON object with their associated paths
 */
export function extractStrings(
  json: JsonValue,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};

  if (typeof json === "string") {
    result[prefix] = json;
  } else if (json && typeof json === "object" && !Array.isArray(json)) {
    for (const [key, value] of Object.entries(json)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      const strings = extractStrings(value, newPrefix);
      Object.assign(result, strings);
    }
  } else if (Array.isArray(json)) {
    json.forEach((item, index) => {
      const newPrefix = `${prefix}[${index}]`;
      const strings = extractStrings(item, newPrefix);
      Object.assign(result, strings);
    });
  }

  return result;
}

/**
 * Replaces string values in a JSON object based on a provided mapping
 */
export function replaceStrings(
  json: JsonValue,
  translations: Record<string, string>,
  prefix = ""
): JsonValue {
  if (typeof json === "string") {
    return translations[prefix] || json;
  } else if (json && typeof json === "object" && !Array.isArray(json)) {
    const result: Record<string, JsonValue> = {};
    for (const [key, value] of Object.entries(json)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      result[key] = replaceStrings(value, translations, newPrefix);
    }
    return result;
  } else if (Array.isArray(json)) {
    return json.map((item, index) => {
      const newPrefix = `${prefix}[${index}]`;
      return replaceStrings(item, translations, newPrefix);
    });
  }

  return json;
}

/**
 * Resolves a file path by replacing the [locale] placeholder with the actual locale code
 */
export function resolveLocalePath(
  pathTemplate: string,
  locale: string
): string {
  return pathTemplate.replace(/\[locale\]/g, locale);
}
