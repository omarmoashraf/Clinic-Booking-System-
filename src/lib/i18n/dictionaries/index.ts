import { en, type TranslationSchema } from "../resources/en";
import { ar } from "../resources/ar";
import type { Locale } from "../config";

export const dictionaries: Record<Locale, TranslationSchema> = {
  en,
  ar,
};

export { en, ar };
export type { TranslationSchema };
