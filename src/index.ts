#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import "dotenv/config"; // Load environment variables from .env file
import { loadConfig } from "./config.js";
import {
  ProviderType,
  TranslationProviderFactory,
} from "./providers/provider-factory.js";
import { TranslationService } from "./translation-service.js";

// Create CLI program
const program = new Command();

// Set up basic program information
program
  .name("translocalize")
  .description(
    "CLI tool to automate translation of JSON language files using AI models"
  )
  .version("1.0.0");

// Add translate command
program
  .command("translate")
  .description("Translate language files based on configuration")
  .option(
    "-p, --provider <provider>",
    "AI provider to use (default: gemini)",
    "gemini"
  )
  .option("-k, --key <apiKey>", "API key for the AI provider")
  .action(async (options) => {
    try {
      // Check for API key
      const apiKey =
        options.key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

      if (!apiKey) {
        console.error(
          chalk.red(
            "Error: API key is required. Provide it using --key option or GEMINI_API_KEY/GOOGLE_API_KEY environment variable."
          )
        );
        process.exit(1);
      }

      // Load configuration
      console.log(chalk.blue("Loading configuration..."));
      const config = await loadConfig();

      // Create provider
      const provider = TranslationProviderFactory.createProvider(
        options.provider as ProviderType,
        apiKey
      );

      // Initialize and run translation service
      const service = new TranslationService(config, provider);
      await service.translate();
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`Error: ${error.message}`));
      } else {
        console.error(chalk.red("An unknown error occurred"));
      }
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
