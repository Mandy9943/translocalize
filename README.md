# TransLocalize

A CLI tool to automate the translation of JSON language files using AI models.

## Installation

### For Development

Clone the repository and set up the project:

```bash
git clone <repository-url>
cd translocalize
npm install
npm run build
npm link
```

The `npm link` command will make the CLI tool available globally on your system.

## Setup

1. Create a `translocalize.json` configuration file in the root of your project:

```json
{
  "projectId": "your-project-id", // Optional identifier
  "locale": {
    "source": "en", // The source language code
    "targets": ["es", "de", "fr", "it"] // Array of target language codes
  },
  "files": {
    "json": {
      // Path template where [locale] is replaced by the language code
      "include": ["messages/[locale].json"]
    }
  }
}
```

2. Make sure you have your source language file (e.g., `messages/en.json`) created.

## Usage

### Using Environment Variables (Recommended)

1. Create a `.env` file in your project root:

```
GEMINI_API_KEY=your-api-key
```

2. Run the translation:

```bash
translocalize translate
```

TransLocalize automatically loads environment variables from `.env` files in your project directory, so you don't need any additional setup.

### Command Line Options

Translate language files directly with an API key:

```bash
translocalize translate --key YOUR_API_KEY
```

Or, using an environment variable:

```bash
export GEMINI_API_KEY=your-api-key
translocalize translate
```

### Options

- `-p, --provider <provider>`: AI provider to use (default: "gemini")
- `-k, --key <apiKey>`: API key for the AI provider

## Environment Variables

- `GEMINI_API_KEY` or `GOOGLE_API_KEY`: Your Google Gemini API key

## How It Works

TransLocalize performs the following steps:

1. Reads the configuration from `translocalize.json`
2. Identifies the source language file based on the configuration
3. Extracts all string values from the source file
4. For each target language:
   - Translates the extracted strings using the AI provider
   - Preserves the original JSON structure
   - Generates a new language file with the translations

## License

MIT 