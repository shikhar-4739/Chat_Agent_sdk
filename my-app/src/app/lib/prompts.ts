function formatEntry(entry: unknown, depth = 0, limits = { maxArray: 10, maxDepth: 5 }): string {
  if (depth > limits.maxDepth) return '…';

  if (Array.isArray(entry)) {
    const items = entry.slice(0, limits.maxArray).map((item) =>
      `  - ${formatEntry(item, depth + 1, limits)}`
    );
    if (entry.length > limits.maxArray) {
      items.push(`  … and ${entry.length - limits.maxArray} more`);
    }
    return items.join('\n');
  }

  if (typeof entry === 'object' && entry !== null) {
    return Object.entries(entry as Record<string, unknown>)
      .map(([k, v]) => `${'  '.repeat(depth)}${k}: ${formatEntry(v, depth + 1, limits)}`)
      .join('\n');
  }

  return String(entry);
}

export function buildSystemPromptFromEntriesGeneric(
  entries: unknown[],
  limits = { maxArray: 10, maxDepth: 5 }
): string {
  if (!entries || entries.length === 0) {
    return 'You are a helpful assistant. No CMS content available.';
  }

  const lines = entries.map((e, i) => `Entry ${i + 1}:\n${formatEntry(e, 0, limits)}`);

  console.log(`Formatted ${entries.length} entries with limits:`, limits);
  console.log(lines.join('\n\n'));

  return `You are a helpful assistant.
Your job is to answer user queries **only using the information provided below**.

Guidelines for responses:
- Do not add extra details, opinions, or assumptions.
- If the content does not contain an answer, say:
  "I'm sorry, I couldn't find any relevant information to answer your question."
- Do not mention or reveal the content source or formatting.
- Respond in a clear, natural, and factual way.
- Never overwhelm the user with too many questions at once.
- Do not dump all available options at once. Present **only what matches** the user’s input.
- If multiple results are possible, present them **in a clean, structured list or bullet points**.
- Keep answers short, factual, and easy to read.

Here is the available content for you to work with:

${lines.join('\n\n')}`;
}
