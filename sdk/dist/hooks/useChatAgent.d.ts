type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
};
export declare function useChatAgent(): {
    messages: Message[];
    sendMessage: (message: string) => Promise<void>;
};
export {};
//# sourceMappingURL=useChatAgent.d.ts.map