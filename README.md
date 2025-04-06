# TransLocalize

A CLI tool to automate the translation of JSON language files using AI models.

## Installation

You can install TransLocalize globally:

```bash
npm install -g translocalize
```

Or use it directly with npx:

```bash
npx translocalize translate --key YOUR_API_KEY
```

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

2. Install dotenv as a development dependency:

```bash
npm install --save-dev dotenv
```

3. Add a script in your package.json:

```json
{
  "scripts": {
    "translate": "node -r dotenv/config node_modules/.bin/translocalize translate"
  }
}
```

4. Run the translation:

```bash
npm run translate
```

### Command Line Options

Translate language files directly:

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

## Development

To build from source:

```bash
git clone <repository-url>
cd translocalize
npm install
npm run build
```

## License

MIT 