"use client";

import { useState, useEffect, useRef } from "react";
import { useChatConfig } from "./ChatProvider.js";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

export default function ChatWidget() {
  const {
    provider,
    apiKey,
    model,
    cs_api_key,
    cs_delivery_token,
    content_type,
    theme
  } = useChatConfig();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`https://chat-agent-olive.vercel.app/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          message: input,
          contentType: content_type,
          contentStack_api_key: cs_api_key,
          contentStack_delivery_token: cs_delivery_token,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botMessage += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: botMessage,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Sorry, something went wrong." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const themeVars = `
  .chatbot-fixed-container {
    --chatbotButtonColor: ${theme.chatbotButtonColor};
    --chatbotHeaderColor: ${theme.chatbotHeaderColor};
    --userAvatarBgColor: ${theme.userAvatarBgColor};
    --assistantAvatarBgColor: ${theme.assistantAvatarBgColor};
    --sendButtonColor: ${theme.sendButtonColor};
  }
`;

  return (
    <>
      <style>{themeVars}</style>
      <style>{`
        .chatbot-relative-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
        }
        .chatbot-fixed-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
        }
        .chatbot-toggle-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 56px;
          height: 56px;
          background: var(--chatbotButtonColor);
          color: #fff;
          border-radius: 50%;
          box-shadow: 0 4px 24px rgba(139, 92, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .chatbot-toggle-btn:hover {
          opacity: 0.9;
        }
        .chatbot-box {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 380px;
          max-width: 96vw;
          height: 550px;
          background: #fff;
          color: #222;
          border-radius: 20px;
          box-shadow: 0 8px 32px 0 rgba(139, 92, 246, 0.18);
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .chatbot-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--chatbotHeaderColor);
          color: #fff;
          border-bottom: 1px solid #e5e7eb;
        }
        .chatbot-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .chatbot-avatar, .chatbot-user-avatar, .chatbot-assistant-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
          border: 2px solid #f3e8ff;
        }
        .chatbot-user-avatar {
          background: var(--userAvatarBgColor);
        }
        .chatbot-assistant-avatar {
          background: var(--assistantAvatarBgColor);
        }
        .chatbot-header-info {
          display: flex;
          flex-direction: column;
        }
        .chatbot-title {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .chatbot-status {
          font-size: 0.8rem;
          color: #f3e8ff;
        }
        .chatbot-close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.3rem;
          cursor: pointer;
          font-weight: bold;
        }
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 18px 16px;
          background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .chatbot-empty {
          text-align: center;
          color: #a1a1aa;
          margin-top: 40px;
        }
        .chatbot-message-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .chatbot-user-row {
          flex-direction: row;
          justify-content: flex-start;
        }
        .chatbot-assistant-row {
          flex-direction: row-reverse;
          justify-content: flex-end;
        }
        .chatbot-message-bubble {
          padding: 10px 16px;
          max-width: 75%;
          font-size: 0.97rem;
          border-radius: 18px;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.06);
          word-break: break-word;
          white-space: pre-line;
        }
        .chatbot-user-bubble {
          background: #fff;
          color: #222;
          border: 1px solid #ede9fe;
          border-bottom-left-radius: 8px;
          border-top-right-radius: 18px;
          border-top-left-radius: 18px;
        }
        .chatbot-assistant-bubble {
          background: linear-gradient(90deg, #a78bfa 0%, #f472b6 100%);
          color: #fff;
          border-bottom-right-radius: 8px;
          border-top-right-radius: 18px;
          border-top-left-radius: 18px;
        }
        .chatbot-typing {
          opacity: 0.7;
          font-style: italic;
        }
        .chatbot-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-top: 1px solid #ede9fe;
          background: #fff;
        }
        .chatbot-input {
          flex: 1;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid #ede9fe;
          font-size: 1rem;
          outline: none;
          background: #f5f3ff;
          color: #222;
          transition: border 0.2s;
        }
        .chatbot-input:focus {
          border: 1.5px solid #a78bfa;
        }
        .chatbot-send-btn {
          background: var(--sendButtonColor);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: opacity 0.2s;
        }
        .chatbot-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chatbot-send-icon {
          width: 20px;
          height: 20px;
        }
      `}</style>
      <div className="chatbot-fixed-container">
        <div className="chatbot-relative-wrapper">
          {/* Floating Toggle Button */}
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="chatbot-toggle-btn"
            >
              💬
            </button>
          )}

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ duration: 0.2 }}
                className="chatbot-box"
              >
                {/* Header */}
                <div className="chatbot-header">
                  <div className="chatbot-header-left">
                    <div className="chatbot-avatar">🤖</div>
                    <div className="chatbot-header-info">
                      <div className="chatbot-title">Sendbird Bot</div>
                      <div className="chatbot-status">We’re online...</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="chatbot-close-btn"
                  >
                    ✖
                  </button>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                  {messages.length === 0 && (
                    <div className="chatbot-empty">Start the conversation!</div>
                  )}
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`chatbot-message-row ${m.role === "user" ? "chatbot-user-row" : "chatbot-assistant-row"}`}
                    >
                      {m.role === "user" && (
                        <div className="chatbot-user-avatar">🧑</div>
                      )}
                      <div
                        className={`chatbot-message-bubble ${m.role === "user" ? "chatbot-user-bubble" : "chatbot-assistant-bubble"}`}
                      >
                        {m.content}
                      </div>
                      {m.role === "assistant" && (
                        <div className="chatbot-assistant-avatar">🤖</div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="chatbot-message-row chatbot-assistant-row">
                      <div className="chatbot-message-bubble chatbot-assistant-bubble chatbot-typing">Typing...</div>
                      <div className="chatbot-assistant-avatar">🤖</div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Box */}
                <form
                  className="chatbot-input-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                >
                  <input
                    className="chatbot-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter message"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="chatbot-send-btn"
                  >
                    <Send className="chatbot-send-icon" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
