"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatConfig } from "../components/ChatProvider.js";

type Message = { id: string; role: 'user' | 'assistant' | 'system'; text: string };

export function useChatAgent() {
  const {
    provider,
    apiKey,
    model,
    cs_api_key,
    cs_delivery_token,
    content_type,
  } = useChatConfig();

  const [messages, setMessages] = useState<Message[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      // Append user message
      const userMsg: Message = {
        id: String(Date.now()),
        role: "user",
        text: message,
      };
      setMessages((m) => [...m, userMsg]);

      // Cancel any previous stream
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const res = await fetch(`https://chat-agent-olive.vercel.app/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            apiKey,
            model,
            message,
            contentType: content_type,
            contentStack_api_key: cs_api_key,
            contentStack_delivery_token: cs_delivery_token,
          }),
          signal: controller.signal,
        });

        if (!res.body) {
          const txt = await res.text();
          const errMsg: Message = { id: String(Date.now()+1), role: 'assistant', text: `Error: ${txt}` };
          setMessages(m => [...m, errMsg]);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        // Add placeholder assistant message
        const assistantId = String(Date.now() + 2);
        setMessages(m => [...m, { id: assistantId, role: 'assistant', text: assistantText }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantText += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: assistantText } : msg
            )
          );
        }
      } catch (err: any) {
        console.error("Chat error:", err);
        setMessages((m) => [
          ...m,
          { id: String(Date.now() + 3), role: "assistant", text: "⚠️ Sorry, something went wrong." },
        ]);
      }
    },
    [provider, apiKey, model, cs_api_key, cs_delivery_token, content_type]
  );

  return { messages, sendMessage };
}
