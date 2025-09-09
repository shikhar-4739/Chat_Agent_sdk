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
export declare function ChatProvider({ provider, model, apiKey, cs_api_key, cs_delivery_token, content_type, theme, children, }: {
    provider: string;
    model: string;
    apiKey: string;
    cs_api_key: string;
    cs_delivery_token: string;
    content_type: string;
    theme?: ChatTheme;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useChatConfig(): ChatContextType;
export {};
//# sourceMappingURL=ChatProvider.d.ts.map