"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatContainerProps {
  messages: Message[];
  isStreaming: boolean;
  isLoading: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
}

export function ChatContainer({
  messages,
  isStreaming,
  isLoading,
  onSend,
  onStop,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Chat with TARS
            </h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Ask about your business performance, get reports, or request
              strategic recommendations. I&apos;m here to help you grow.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-zinc-500 text-sm">
              Loading messages...
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}

        {isStreaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-zinc-300" />
            </div>
            <div className="bg-zinc-800 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatInput
        onSend={onSend}
        onStop={onStop}
        isStreaming={isStreaming}
        disabled={isLoading}
      />
    </div>
  );
}
