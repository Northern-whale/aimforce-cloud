"use client";

import { useState, useCallback, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage: string | null;
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/chat/conversations");
    const data = await res.json();
    if (data.success) {
      setConversations(data.data);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsLoading(true);
    const res = await fetch(`/api/chat?conversationId=${conversationId}`);
    const data = await res.json();
    if (data.success) {
      setMessages(data.data);
    }
    setIsLoading(false);
  }, []);

  const createConversation = useCallback(async () => {
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (data.success) {
      setActiveConversationId(data.data.id);
      setMessages([]);
      await loadConversations();
      return data.data.id;
    }
    return null;
  }, [loadConversations]);

  const sendMessage = useCallback(
    async (content: string, inputMethod: "text" | "voice" = "text") => {
      let conversationId = activeConversationId;

      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) return;
      }

      // Add user message optimistically
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Add placeholder for assistant response
      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(true);

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content, inputMethod }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Stream request failed");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      updated[updated.length - 1] = {
                        ...lastMsg,
                        content: accumulated,
                      };
                    }
                    return updated;
                  });
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        // Refresh conversation list
        await loadConversations();
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Chat error:", error);
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === "assistant" && !lastMsg.content) {
              updated[updated.length - 1] = {
                ...lastMsg,
                content: "Sorry, an error occurred. Please try again.",
              };
            }
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeConversationId, createConversation, loadConversations]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isStreaming,
    loadConversations,
    loadMessages,
    createConversation,
    sendMessage,
    stopStreaming,
    setActiveConversationId,
  };
}
