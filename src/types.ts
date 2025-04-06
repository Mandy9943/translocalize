export interface TransLocalizeConfig {
  projectId?: string;
  locale: {
    source: string;
    targets: string[];
  };
  files: {
    json: {
      include: string[];
    };
  };
}

export interface TranslationProvider {
  translateStrings(
    strings: Record<string, string>,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<Record<string, string>>;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type JsonObject = Record<string, JsonValue>;
