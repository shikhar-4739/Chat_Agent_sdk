"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const ChatContext = createContext(null);
export function ChatProvider({ provider, model, apiKey, cs_api_key, cs_delivery_token, content_type, theme = {}, children, }) {
    const defaultTheme = {
        chatbotButtonColor: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
        chatbotHeaderColor: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
        userAvatarBgColor: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
        assistantAvatarBgColor: "linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%)",
        sendButtonColor: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
    };
    const mergedTheme = { ...defaultTheme, ...theme };
    return (_jsx(ChatContext.Provider, { value: { provider, model, apiKey, cs_api_key, cs_delivery_token, content_type, theme: mergedTheme }, children: children }));
}
export function useChatConfig() {
    const ctx = useContext(ChatContext);
    if (!ctx)
        throw new Error("useChatConfig must be used inside ChatProvider");
    return ctx;
}
//# sourceMappingURL=ChatProvider.js.map