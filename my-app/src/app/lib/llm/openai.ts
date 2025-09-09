import { LLMProvider, ChatMessage, OnDelta } from './base';

export class OpenAIProvider implements LLMProvider {
  providerId = 'openai';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('OpenAIProvider requires an API key');
    this.apiKey = apiKey;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const r = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  async chat(messages: ChatMessage[], opts: { model: string; maxTokens?: number }) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: opts.maxTokens ?? 800,
        stream: false,
      }),
    });
    const j = await res.json();
    return j.choices?.[0]?.message?.content ?? '';
  }

  async streamChat(messages: ChatMessage[], opts: { model: string; maxTokens?: number }, onDelta: OnDelta) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: opts.maxTokens ?? 800,
        stream: true,
      }),
    });

    if (!res.body) throw new Error('OpenAI: no response body');

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
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.replace(/^data:\s*/, '');
        if (payload === '[DONE]') return;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
        } catch (e) {
          // ignore non-json chunks
          console.log('OpenAI stream parse error:', e);
        }
      }
    }
  }
}
