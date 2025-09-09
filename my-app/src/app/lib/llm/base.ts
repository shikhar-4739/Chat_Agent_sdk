export type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: Role;
  content: string;
}

export type OnDelta = (delta: string) => void;

export interface LLMProvider {
  providerId: string; // e.g., "openai"
  healthCheck(apiKey: string): Promise<boolean>;
  chat(messages: ChatMessage[], opts: { apiKey: string; model: string; maxTokens?: number }): Promise<string>;
  streamChat(
    messages: ChatMessage[],
    opts: { apiKey: string; model: string; maxTokens?: number },
    onDelta: OnDelta
  ): Promise<void>;
}
