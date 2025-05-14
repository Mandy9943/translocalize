import chalk from "chalk";
import { glob } from "glob";
import path from "path";
import {
  extractStrings,
  readJsonFile,
  replaceStrings,
  resolveLocalePath,
  writeJsonFile,
} from "./json-utils.js";
import {
  JsonObject,
  TranslationProvider,
  TransLocalizeConfig,
} from "./types.js";

export class TranslationService {
  private config: TransLocalizeConfig;
  private provider: TranslationProvider;

  constructor(config: TransLocalizeConfig, provider: TranslationProvider) {
    this.config = config;
    this.provider = provider;
  }

  /**
   * Executes the translation process
   */
  async translate(): Promise<void> {
    const { config } = this;
    const sourceLocale = config.locale.source;
    const targetLocales = config.locale.targets;
    const CHUNK_SIZE = 300; // Number of strings to process in each chunk

    console.log(
      chalk.blue(
        `Starting translation from ${chalk.bold(sourceLocale)} to ${chalk.bold(
          targetLocales.join(", ")
        )}`
      )
    );

    for (const pathTemplate of config.files.json.include) {
      const sourceFilePath = path.resolve(
        process.cwd(),
        resolveLocalePath(pathTemplate, sourceLocale)
      );

      // Use glob to find matching files
      const matchingFiles = glob.sync(sourceFilePath);

      if (matchingFiles.length === 0) {
        console.warn(
          chalk.yellow(`Warning: No files found matching ${sourceFilePath}`)
        );
        continue;
      }

      for (const sourceFile of matchingFiles) {
        console.log(
          chalk.blue(`\nProcessing source file: ${chalk.bold(sourceFile)}`)
        );

        // Read and parse source file
        const sourceData = await readJsonFile(sourceFile);

        // Extract all string values from the source JSON
        const strings = extractStrings(sourceData);
        const stringKeys = Object.keys(strings);

        console.log(
          chalk.blue(
            `Found ${chalk.bold(stringKeys.length)} strings to translate`
          )
        );

        // Process each target locale
        for (const targetLocale of targetLocales) {
          console.log(
            chalk.blue(`\nTranslating to ${chalk.bold(targetLocale)}...`)
          );

          // Get target file path
          const targetFilePath = path.resolve(
            process.cwd(),
            resolveLocalePath(pathTemplate, targetLocale)
          );

          // Skip self-translation
          if (sourceLocale === targetLocale) {
            console.log(
              chalk.yellow(`Skipping translation to self (${targetLocale})`)
            );
            continue;
          }

          try {
            let allTranslatedStrings: Record<string, string> = {};

            for (let i = 0; i < stringKeys.length; i += CHUNK_SIZE) {
              const chunkKeys = stringKeys.slice(i, i + CHUNK_SIZE);
              const chunkStrings: Record<string, string> = {};
              for (const key of chunkKeys) {
                chunkStrings[key] = strings[key];
              }

              console.log(
                chalk.blue(
                  `Translating chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(
                    stringKeys.length / CHUNK_SIZE
                  )} (${chunkKeys.length} strings)`
                )
              );

              // Translate strings
              const translatedChunk = await this.provider.translateStrings(
                chunkStrings,
                sourceLocale,
                targetLocale
              );
              allTranslatedStrings = {
                ...allTranslatedStrings,
                ...translatedChunk,
              };
            }

            console.log(
              chalk.green(
                `Successfully translated ${chalk.bold(
                  Object.keys(allTranslatedStrings).length
                )} strings`
              )
            );

            // Replace strings in the source data with translated strings
            const translatedData = replaceStrings(
              sourceData,
              allTranslatedStrings
            ) as JsonObject;

            // Write translated data to the target file
            await writeJsonFile(targetFilePath, translatedData);

            console.log(
              chalk.green(
                `Translations written to ${chalk.bold(targetFilePath)}`
              )
            );
          } catch (error) {
            if (error instanceof Error) {
              console.error(
                chalk.red(
                  `Error translating to ${targetLocale}: ${error.message}`
                )
              );
            } else {
              console.error(
                chalk.red(`Unknown error translating to ${targetLocale}`)
              );
            }
          }
        }
      }
    }

    console.log(chalk.green.bold("\nTranslation process completed"));
  }
}
