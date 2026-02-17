"use client";

import { useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatContainer } from "@/components/chat/chat-container";
import { Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const {
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
  } = useChat();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="flex h-[calc(100vh-3.5rem-2rem)] md:h-[calc(100vh-3.5rem-3rem)] gap-4">
      {/* Conversation Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shrink-0">
        <div className="p-3 border-b border-zinc-800">
          <button
            onClick={createConversation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadMessages(conv.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                activeConversationId === conv.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-zinc-500 text-center py-4">
              No conversations yet
            </p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <ChatContainer
          messages={messages}
          isStreaming={isStreaming}
          isLoading={isLoading}
          onSend={sendMessage}
          onStop={stopStreaming}
        />
      </div>
    </div>
  );
}
