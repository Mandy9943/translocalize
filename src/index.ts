#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import "dotenv/config"; // Load environment variables from .env file
import fs from "fs-extra";
import path from "path";
import readline from "readline";
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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for user input
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Add init command
program
  .command("init")
  .description("Initialize TransLocalize in the current project")
  .action(async () => {
    try {
      console.log(chalk.blue("Initializing TransLocalize..."));

      // Generate a random project ID
      const projectId = `prj_${Math.random().toString(36).substring(2, 15)}`;

      // Prompt for source locale
      const sourceLocale = await prompt(
        chalk.yellow("Source locale (e.g., en): ")
      );
      if (!sourceLocale) {
        throw new Error("Source locale is required");
      }

      // Prompt for target locales
      const targetLocalesInput = await prompt(
        chalk.yellow("Target locales (comma-separated, e.g., es,fr,de): ")
      );
      if (!targetLocalesInput) {
        throw new Error("At least one target locale is required");
      }
      const targetLocales = targetLocalesInput
        .split(",")
        .map((locale) => locale.trim());

      // Prompt for file path pattern
      const defaultPath = `messages/[locale].json`;
      const filePathInput = await prompt(
        chalk.yellow(`File path pattern (default: ${defaultPath}): `)
      );
      const filePath = filePathInput || defaultPath;

      // Create config object
      const config = {
        projectId,
        locale: {
          source: sourceLocale,
          targets: targetLocales,
        },
        files: {
          json: {
            include: [filePath],
          },
        },
      };

      // Write config to file
      const configPath = path.resolve(process.cwd(), "translocalize.json");
      await fs.writeJson(configPath, config, { spaces: 2 });
      console.log(chalk.green(`Created configuration file: ${configPath}`));

      // Create source file and directory if they don't exist
      const sourceFilePath = filePath.replace("[locale]", sourceLocale);
      const fullSourcePath = path.resolve(process.cwd(), sourceFilePath);
      const sourceDir = path.dirname(fullSourcePath);

      if (!(await fs.pathExists(sourceDir))) {
        await fs.mkdirp(sourceDir);
        console.log(chalk.green(`Created directory: ${sourceDir}`));
      }

      if (!(await fs.pathExists(fullSourcePath))) {
        await fs.writeJson(fullSourcePath, {}, { spaces: 2 });
        console.log(chalk.green(`Created source file: ${fullSourcePath}`));
      }

      console.log(chalk.blue("\nTransLocalize initialized successfully!"));
      console.log(chalk.yellow("\nNext steps:"));
      console.log(chalk.yellow("1. Add your strings to the source file"));
      console.log(
        chalk.yellow(
          "2. Run 'translocalize translate' to generate translated files"
        )
      );

      rl.close();
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`Error: ${error.message}`));
      } else {
        console.error(chalk.red("An unknown error occurred"));
      }
      rl.close();
      process.exit(1);
    }
  });

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
