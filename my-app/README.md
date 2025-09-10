# My-App Backend

This folder contains the backend code for the Chat Agent SDK, built with [Next.js](https://nextjs.org). It provides API endpoints for interacting with multiple LLM (Large Language Model) providers and integrates with Contentstack via a custom MCP server.

## Overview

- **API Endpoints:** Located in `src/app/api/`, these endpoints power chat, health checks, and configuration for the chatbot SDK.
- **LLM Providers:** Modular support for OpenAI, Anthropic, and Groq under `src/app/lib/llm/`.
- **Contentstack Integration:** Uses a custom MCP server for secure and flexible content retrieval, with logic in `src/app/lib/contentstack/mcp.ts`.
- **Prompt Engineering:** System prompts are dynamically built from Contentstack entries in `src/app/lib/prompts.ts`.
- **Streaming Responses:** Uses server-sent events (SSE) for real-time chat streaming.

## Folder Structure

```
my-app/
  src/
    app/
      api/
        chat/           # Main chat endpoint (streaming, LLM, Contentstack)
        models/         # Lists available LLM providers and models
      lib/
        llm/            # LLM provider adapters (OpenAI, Anthropic, Groq)
        contentstack/   # Contentstack MCP integration
        prompts.ts      # Builds system prompts from CMS entries
        sse.ts          # Utilities for streaming responses
      layout.tsx        # Next.js root layout
      page.tsx          # Project info and API route listing
    public/             # Static assets
  .env                  # Environment variables (not committed)
  package.json          # Project dependencies and scripts
  README.md             # This file
```

## Key Components

### API Endpoints

- **`/api/chat`**  
  Handles chat requests.  
  - Accepts provider/model/apiKey and Contentstack credentials.
  - Fetches relevant CMS entries via MCP.
  - Builds a system prompt and streams LLM responses.

- **`/api/models`**  
  Lists supported LLM providers and their available models.

### LLM Providers

Adapters for each provider are in [`src/app/lib/llm/`](src/app/lib/llm/):

- [`openai.ts`](src/app/lib/llm/openai.ts): OpenAI GPT models
- [`anthropic.ts`](src/app/lib/llm/anthropic.ts): Anthropic Claude models
- [`groq.ts`](src/app/lib/llm/groq.ts): Groq Llama models
- [`router.ts`](src/app/lib/llm/router.ts): Provider selection logic

All providers implement a common interface for chat and streaming.

### Contentstack MCP Integration

- [`contentstack/mcp.ts`](src/app/lib/contentstack/mcp.ts):  
  Calls the MCP server (see `mcp-server/`) to fetch and search Contentstack entries securely.

### Prompt Engineering

- [`prompts.ts`](src/app/lib/prompts.ts):  
  Formats CMS entries into a system prompt for the LLM, enforcing strict answer guidelines.

### Streaming

- [`sse.ts`](src/app/lib/sse.ts):  
  Utility to convert async generators into readable streams for SSE.

## Development

### Running Locally

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Set environment variables:**  
   Create a `.env` file with your Contentstack MCP URL and any required API keys.

3. **Start the development server:**
   ```sh
   npm run dev
   ```

4. **Start the MCP server:**  
   See [`mcp-server/README.md`](../mcp-server/README.md) for details.

### Building for Production

```sh
npm run build
npm start
```

## Extending

- Add new LLM providers by implementing the interface in [`src/app/lib/llm/base.ts`](src/app/lib/llm/base.ts).
- Add new API endpoints under `src/app/api/`.
- Customize prompt logic in [`prompts.ts`](src/app/lib/prompts.ts).

## Related Projects

- [`mcp-server/`](../mcp-server/): Node.js server for Contentstack MCP API proxy.
- [`sdk/`](../sdk/): React SDK for embedding the chat widget in your frontend.

---

For more details, see the inline code comments and each module's documentation.