import type { Direction, Locale } from "./config";

export type TranslationParams = Record<string, string | number>;

export type TranslationValues = string | { [key: string]: TranslationValues };

export interface TranslationDictionary {
  [section: string]: {
    [key: string]: string | Record<string, string>;
  };
}

export interface I18nContextType {
  locale: Locale;
  direction: Direction;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
}

