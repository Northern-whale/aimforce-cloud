import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamChatResponse } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { conversationId, content, inputMethod = "text" } = await req.json();

  if (!conversationId || !content) {
    return new Response("Missing conversationId or content", { status: 400 });
  }

  // Verify conversation belongs to user
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId,
      role: "user",
      content,
      inputMethod,
    },
  });

  // Get conversation history for context
  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const messages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Auto-generate title from first message
  if (!conversation.title && messages.length <= 1) {
    const title = content.slice(0, 60) + (content.length > 60 ? "..." : "");
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  const startTime = Date.now();

  // Stream response from Claude
  const stream = await streamChatResponse(messages);

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        // Save assistant message after streaming completes
        const latencyMs = Date.now() - startTime;
        const finalMessage = await stream.finalMessage();
        const tokenCount =
          finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;

        await prisma.message.create({
          data: {
            conversationId,
            role: "assistant",
            content: fullResponse,
            tokenCount,
            latencyMs,
          },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Stream error" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
