"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />

        {isStreaming ? (
          <button
            onClick={onStop}
            className="p-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors shrink-0"
          >
            <Square className="w-4 h-4 text-white" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
