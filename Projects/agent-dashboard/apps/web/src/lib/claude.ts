import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are TARS, an AI business assistant. You help business owners with:
- Analyzing business performance and providing actionable insights
- Answering questions about sales, traffic, and customer behavior
- Generating reports and summaries
- Providing strategic recommendations for growth
- Managing and reviewing automation workflows

Be concise, data-driven, and professional. When you don't have specific data, acknowledge it and provide general best practices. Always focus on actionable advice that drives revenue.`;

export async function streamChatResponse(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  return anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages,
  });
}

export async function getChatResponse(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return {
    content: textBlock?.text || "",
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
