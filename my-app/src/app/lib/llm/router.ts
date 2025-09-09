import { LLMProvider } from './base';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GroqProvider } from './groq';

export function getProvider(providerId: string, apiKey: string): LLMProvider | null {
  switch (providerId) {
    case "openai":
      return new OpenAIProvider(apiKey);
    case "anthropic":
      return new AnthropicProvider(apiKey);
    case "groq":
      return new GroqProvider(apiKey);
    default:
      return null;
  }
}

export function listProviders() {
  return [
    { provider: "openai" },
    { provider: "anthropic" },
    { provider: "groq" },
  ];
}