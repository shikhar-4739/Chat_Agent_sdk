import { LLMProvider, ChatMessage, OnDelta } from './base';

export class AnthropicProvider implements LLMProvider {
  providerId = 'anthropic';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('AnthropicProvider requires an API key');
    this.apiKey = apiKey;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const r = await fetch('https://api.anthropic.com/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  async chat(messages: ChatMessage[], opts: { model: string; maxTokens?: number }) {
    const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const res = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        prompt,
        max_tokens_to_sample: opts.maxTokens ?? 800,
        stop_sequences: ['\n\nUSER:'],
      }),
    });
    const j = await res.json();
    return j.completion ?? '';
  }

  async streamChat(messages: ChatMessage[], opts: { model: string; maxTokens?: number }, onDelta: OnDelta) {
    const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const res = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        prompt,
        max_tokens_to_sample: opts.maxTokens ?? 800,
        stream: true,
      }),
    });

    if (!res.body) throw new Error('Anthropic: no response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Anthropic streaming lines may be raw deltas — try to parse JSON first
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.completion_delta) {
            onDelta(parsed.completion_delta);
          } else if (parsed.completion) {
            onDelta(parsed.completion);
          }
        } catch {
          // fallback: send line directly
          onDelta(trimmed);
        }
      }
    }
  }
}
