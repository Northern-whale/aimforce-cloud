export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  inputMethod: "text" | "voice";
  tokenCount?: number;
  latencyMs?: number;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  inputMethod?: "text" | "voice";
}

export interface CreateConversationRequest {
  title?: string;
}
