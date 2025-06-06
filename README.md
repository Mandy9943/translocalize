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

### Using the Init Command (Recommended)

Run the interactive setup wizard to create the configuration file and folder structure:

```bash
translocalize init
```

The wizard will prompt you for:
1. Source locale (e.g., "en")
2. Target locales (comma-separated, e.g., "es,fr,de,it")
3. File path pattern (default: "messages/[locale].json")

This will create:
- A `translocalize.json` configuration file in your project root
- The directory structure for your language files
- An empty source language file you can populate with your strings

### Manual Configuration

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

### Getting a Gemini API Key

To use TransLocalize, you'll need a Google Gemini API key:

1. Visit [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Create a new API key or use an existing one
4. Copy the API key for use with TransLocalize

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