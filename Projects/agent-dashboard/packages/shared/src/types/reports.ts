export interface DashboardMetrics {
  totalCalls: number;
  totalConversations: number;
  avgCallDuration: number;
  avgResponseTime: number;
  callsTrend: number;
  conversationsTrend: number;
}

export interface CallLog {
  id: string;
  externalId?: string;
  phoneNumber?: string;
  direction: "inbound" | "outbound";
  status: "completed" | "missed" | "transferred";
  duration?: number;
  summary?: string;
  transcript?: string;
  sentiment?: "positive" | "neutral" | "negative";
  transferredTo?: string;
  createdAt: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}
