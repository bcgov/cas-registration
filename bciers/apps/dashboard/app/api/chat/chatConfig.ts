import OpenAI from "openai";

/** Only the last MAX_TURNS chat turns are sent, each cut to MAX_CHARS_PER_TURN. */
export const MAX_TURNS = 8;
export const MAX_CHARS_PER_TURN = 2000;

/** OpenRouter rejects a `models` fallback list longer than this with a 400. */
export const MAX_OPENROUTER_MODELS = 3;

/** A model that sends nothing for this long is skipped for the next one. */
export const FIRST_CHUNK_TIMEOUT_MS = 30_000;

export const CHAT_QUOTA_MESSAGE =
  "The free model quota has been reached. Try again in a few minutes.";
export const CHAT_ERROR_MESSAGE = "The chat service is unavailable right now.";

/** OpenRouter's OpenAI-compatible endpoint, used unless CHAT_BASE_URL overrides it. */
export const DEFAULT_CHAT_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Models from CHAT_MODELS, in priority order.
 * e.g. "meta-llama/llama-3.3-70b-instruct:free,google/gemma-3-27b-it:free"
 */
export function getChatModels(): string[] {
  return (process.env.CHAT_MODELS ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}

let client: OpenAI | undefined;

/**
 * Lazily creates the client so importing this module never throws when
 * CHAT_API_KEY is unset (the route checks isChatEnabled() first).
 */
export function getChatClient(): OpenAI {
  client ??= new OpenAI({
    baseURL: process.env.CHAT_BASE_URL || DEFAULT_CHAT_BASE_URL,
    apiKey: process.env.CHAT_API_KEY,
    // Fallback is handled across models in the route, so don't retry one model.
    maxRetries: 0,
  });
  return client;
}
