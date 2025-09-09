"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type ChatContextType = {
  provider: string;
  model: string;
  apiKey: string;
  cs_api_key: string;
  cs_delivery_token: string;
  content_type: string;
  theme: ChatTheme;
};

export interface ChatTheme {
  chatbotButtonColor?: string;
  chatbotHeaderColor?: string;
  userAvatarBgColor?: string;
  assistantAvatarBgColor?: string;
  sendButtonColor?: string;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({
  provider,
  model,
  apiKey,
  cs_api_key,
  cs_delivery_token,
  content_type,
  theme = {},
  children,
}: {
  provider: string;
  model: string;
  apiKey: string;
  cs_api_key: string;
  cs_delivery_token: string;
  content_type: string;
  theme?: ChatTheme;
  children: ReactNode;
}) {

  const defaultTheme: ChatTheme = {
    chatbotButtonColor: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
    chatbotHeaderColor: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
    userAvatarBgColor: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
    assistantAvatarBgColor: "linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%)",
    sendButtonColor: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
  };

  const mergedTheme = { ...defaultTheme, ...theme };
  return (
    <ChatContext.Provider value={{ provider, model, apiKey, cs_api_key, cs_delivery_token, content_type, theme: mergedTheme }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatConfig() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatConfig must be used inside ChatProvider");
  return ctx;
}
