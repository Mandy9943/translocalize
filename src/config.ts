import fs from "fs-extra";
import path from "path";
import { TransLocalizeConfig } from "./types.js";

/**
 * Loads the translocalize configuration from the current directory
 */
export async function loadConfig(): Promise<TransLocalizeConfig> {
  const configPath = path.resolve(process.cwd(), "translocalize.json");

  try {
    if (!(await fs.pathExists(configPath))) {
      throw new Error("Configuration file not found: translocalize.json");
    }

    const configContent = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configContent) as TransLocalizeConfig;

    validateConfig(config);

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Validates the configuration object
 */
function validateConfig(config: TransLocalizeConfig): void {
  if (
    !config.locale ||
    !config.locale.source ||
    !Array.isArray(config.locale.targets)
  ) {
    throw new Error(
      "Invalid configuration: locale.source and locale.targets array are required"
    );
  }

  if (
    !config.files ||
    !config.files.json ||
    !Array.isArray(config.files.json.include)
  ) {
    throw new Error(
      "Invalid configuration: files.json.include array is required"
    );
  }

  if (config.files.json.include.length === 0) {
    throw new Error(
      "Invalid configuration: files.json.include array cannot be empty"
    );
  }
}
