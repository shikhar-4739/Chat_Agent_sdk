import { NextRequest, NextResponse } from "next/server";
import { buildSystemPromptFromEntriesGeneric } from "@/app/lib/prompts";
import { createReadableStreamFromAsyncIterator } from "@/app/lib/sse";
import { getProvider } from "@/app/lib/llm/router";
import { ChatMessage } from "@/app/lib/llm/base";
import { searchEntriesMCP } from "@/app/lib/contentstack/mcp";

interface ChatRequestBody {
  provider: string;
  apiKey?: string;
  model?: string;
  message?: string;
  messages?: Array<{ role: string; content: string }>;
  contentType?: string;
  contentStack_api_key: string;
  contentStack_delivery_token: string;
}

// CORS helper
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const headers = new Headers(CORS_HEADERS);
  let body: ChatRequestBody;
  try {
    body = await req.json();

    if (!body.provider) {
      return new Response("Missing required field: provider", { status: 400 });
    }

    if (!body.message && !body.messages) {
      return new Response("Missing required field: message or messages", {
        status: 400,
      });
    }

    if (!body.model) {
      return new Response("Missing required field: model", { status: 400 });
    }
    if (!body.contentType) {
      return new Response("Missing required field: contentType", {
        status: 400,
      });
    }
    if (!body.contentStack_api_key) {
      return new Response("Missing required field: contentStack_api_key", {
        status: 400,
      });
    }
    if (!body.contentStack_delivery_token) {
      return new Response(
        "Missing required field: contentStack_delivery_token",
        { status: 400 }
      );
    }
    if (!body.apiKey) {
      return new Response("Missing required field: apiKey", { status: 400 });
    }
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return new Response("Invalid request body", { status: 400 });
  }

  const {
    provider,
    apiKey,
    model,
    contentType,
    contentStack_api_key,
    contentStack_delivery_token,
  } = body;

  let userMessage: string;
  if (body.message) {
    userMessage = body.message;
  } else if (body.messages && body.messages.length > 0) {
    const userMessages = body.messages.filter((m) => m.role === "user");
    userMessage = userMessages[userMessages.length - 1]?.content || "";
  } else {
    return new Response("No valid message content found", { status: 400 });
  }

  console.log("Incoming request:", {
    provider,
    model,
    message: userMessage,
    contentType,
    contentStack_api_key,
    contentStack_delivery_token,
  });

  // Get LLM adapter
  const adapter = getProvider(provider, apiKey);
  if (!adapter) {
    console.log("Unsupported provider:", provider);
    return new Response("Unsupported provider", { status: 400 });
  }

  // Fetch relevant content from Contentstack using MCP instead of REST API
  let entries = [];
  try {
    // Try MCP first, fall back to REST API if it fails
    entries = await searchEntriesMCP(
      contentType,
      userMessage,
      contentStack_api_key,
      contentStack_delivery_token
    );
    console.log(`Found ${entries.length} relevant entries using MCP`);
  } catch (error) {
    console.warn("Failed to fetch entries from Contentstack:", error);
  }

  const systemPrompt = buildSystemPromptFromEntriesGeneric(entries);

  // console.log('System Prompt:', systemPrompt);

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  // Create a proper async generator for streaming
  async function* streamResponse() {
    if (!adapter) {
      yield `\n\n[ERROR] Adapter is not available.`;
      return;
    }
    const queue: string[] = [];
    let streamResolved = false;
    let pendingResolve: ((value: void) => void) | null = null;

    // Create a promise that resolves when there's new data
    const waitForData = () =>
      new Promise<void>((resolve) => {
        pendingResolve = resolve;
      });

    // Callback to push deltas into the queue
    const onDelta = (delta: string) => {
      if (delta) {
        queue.push(delta);
        if (pendingResolve) {
          pendingResolve();
          pendingResolve = null;
        }
      } else {
        console.log("Empty delta received");
      }
    };

    try {
      // Start streaming chat
      const streamPromise = adapter.streamChat(
        messages,
        { apiKey: process.env.ANTHROPIC_KEY ?? "", model: model ?? "" },
        onDelta
      );

      // Log Promise state transitions
      console.log("Stream initialized - waiting for response");
      let responseReceived = false;
      streamPromise
        .then(() => {
          console.log(
            `Stream completed successfully. Received data: ${
              responseReceived ? "Yes" : "No"
            }`
          );
        })
        .catch((err) =>
          console.error("Stream error:", err?.message || "Unknown error")
        );

      // Process until we're done and queue is empty
      while (!streamResolved || queue.length > 0) {
        // If queue is empty but stream isn't done, wait for more data
        if (queue.length === 0 && !streamResolved) {
          console.log("Queue empty, waiting for more data...");
          await waitForData();
          continue;
        }

        // Yield all available chunks
        while (queue.length > 0) {
          const chunk = queue.shift()!;
          responseReceived = true;
          yield chunk;
        }

        // Check if the stream is resolved
        if (!streamResolved && streamPromise) {
          try {
            await Promise.race([
              streamPromise.then(() => {
                streamResolved = true;
              }),
              new Promise((r) => setTimeout(r, 100)),
            ]);
          } catch (error) {
            console.error("Stream promise error:", error);
            streamResolved = true;
          }
        }
      }
    } catch (error) {
      console.error("Error during streaming:", error);
      yield `\n\n[ERROR] An error occurred while generating the response.`;
    }
  }

  try {
    // Use the enhanced stream
    const stream = createReadableStreamFromAsyncIterator(streamResponse());
    console.log("Created readable stream for response - sending to frontend");
    return new Response(stream, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Failed to create stream:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
