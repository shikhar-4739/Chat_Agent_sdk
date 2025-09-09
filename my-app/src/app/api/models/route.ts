
import { listProviders } from '@/app/lib/llm/router';
import { NextResponse } from 'next/server';

export async function GET() {
  const providers = listProviders();
  const body = providers.map(p => {
    if (p.provider === 'openai') return { provider: 'openai', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] };
    if (p.provider === 'anthropic') return { provider: 'anthropic', models: ['claude-3', 'claude-instant'] };
    if (p.provider === 'groq') return { provider: 'groq', models: ['llama-3.3-70b-versatile'] };
    return { provider: p.provider, models: [] };
  });
  return NextResponse.json(body);
}
