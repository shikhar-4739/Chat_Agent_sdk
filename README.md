# Chat Agent SDK – Monorepo

This monorepo contains a complete solution for building, deploying, and integrating an AI-powered chat agent with Contentstack CMS and multiple LLM (Large Language Model) providers. It includes:

- **SDK**: A React component library for embedding the chat widget in your frontend.
- **my-app**: The backend (Next.js) that handles chat API requests, LLM provider integration, and Contentstack content retrieval.
- **mcp-server**: A secure Node.js proxy for Contentstack, enabling safe server-side content access.

---

## Project Structure

```
.
├── my-app/                  # Next.js backend (API, LLM, Contentstack integration)
├── sdk/                     # React SDK for frontend integration
└── mcp-server/              # Node.js Contentstack MCP proxy server
```

---

## 1. SDK ([sdk/](sdk/README.md))

A React SDK for embedding the chat agent in your web app.

- **Features:**
  - Plug-and-play `<ChatWidget />` component.
  - Easy configuration for LLM provider, model, and Contentstack credentials.
  - Theme customization via props.
  - Handles streaming responses and chat UI.
- **Usage:**  
  Install via npm, wrap your app in `<ChatProvider>`, and add `<ChatWidget />`.
- **See:** [sdk/README.md](sdk/README.md) for full usage and customization.

---

## 2. Backend ([my-app/](my-app/README.md))

A Next.js backend that powers the chat agent.

- **API Endpoints:**  
  - `/api/chat`: Main chat endpoint (streams LLM responses, fetches Contentstack content via MCP).
  - `/api/models`: Lists available LLM providers and models.
  - `/api/content`: (Optional) Direct Contentstack access.
- **LLM Providers:**  
  Modular adapters for OpenAI, Anthropic, and Groq in [`src/app/lib/llm/`](my-app/src/app/lib/llm/).
- **Contentstack Integration:**  
  Uses [`src/app/lib/contentstack/mcp.ts`](my-app/src/app/lib/contentstack/mcp.ts) to securely fetch content via the MCP server.
- **Prompt Engineering:**  
  Formats CMS entries into system prompts for the LLM ([`prompts.ts`](my-app/src/app/lib/prompts.ts)).
- **Streaming:**  
  Uses server-sent events (SSE) for real-time chat streaming ([`sse.ts`](my-app/src/app/lib/sse.ts)).
- **Development:**  
  - `npm install` and `npm run dev` to start.
  - Requires `.env` with MCP URL and API keys.
- **See:** [my-app/README.md](my-app/README.md) for details.

---

## 3. MCP Server ([mcp-server/](mcp-server/))

A Node.js server that acts as a secure proxy for Contentstack API requests.

- **Purpose:**  
  - Prevents exposing Contentstack API keys to the frontend.
  - Handles `/entries` and `/search` endpoints for content retrieval.
  - Supports reference fields and search queries.
- **Usage:**  
  - `npm install` and `npm start` to run on port 3001.
  - Used internally by the backend ([`my-app`](my-app/)) for all Contentstack access.
- **See:** [mcp-server/server.js](mcp-server/server.js) for implementation.

---

## How It Works

1. **Frontend (SDK):**  
   User interacts with the chat widget. Messages are sent to the backend API.

2. **Backend (my-app):**  
   Receives chat requests, fetches relevant content from Contentstack (via MCP), builds a system prompt, and streams LLM responses.

3. **MCP Server:**  
   Handles secure Contentstack API calls on behalf of the backend.

---

## Getting Started

### 1. Start MCP Server

```sh
cd mcp-server
npm install
npm start
```

### 2. Start Backend

```sh
cd my-app
npm install
# Set up .env with MCP_URL and API keys
npm run dev
```

### 3. Use SDK in Your Frontend

See [sdk/README.md](sdk/README.md) for integration instructions.

---

## Extending

- **Add LLM Providers:**  
  Implement the interface in [`my-app/src/app/lib/llm/base.ts`](my-app/src/app/lib/llm/base.ts).
- **Customize Prompts:**  
  Edit [`my-app/src/app/lib/prompts.ts`](my-app/src/app/lib/prompts.ts).
- **Add API Endpoints:**  
  Place new routes in [`my-app/src/app/api/`](my-app/src/app/api/).

---

## Related Links

- [my-app/README.md](my-app/README.md): Backend details
- [sdk/README.md](sdk/README.md): SDK usage and customization
- [mcp-server/server.js](mcp-server/server.js): MCP server implementation

---

## License

MIT

---