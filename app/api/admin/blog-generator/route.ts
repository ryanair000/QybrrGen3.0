import { NextRequest, NextResponse } from "next/server";
import {
  BlogPipelineError,
  BlogPipelineStage,
  generateAndPublishBlog,
} from "@/lib/blog-generator/pipeline";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  return NextResponse.json({
    ok: true,
    authMode: "disabled",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const prompt = body && typeof body.prompt === "string" ? body.prompt : "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      function onProgress(
        stage: BlogPipelineStage,
        status: "started" | "completed" | "failed",
        detail?: string
      ) {
        send("progress", { stage, status, detail, timestamp: Date.now() });
      }

      try {
        const post = await generateAndPublishBlog({
          prompt,
          requestedByEmail:
            process.env.BLOG_GENERATOR_REQUESTED_BY_EMAIL ||
            "no-auth@local.qybrr",
          onProgress,
        });

        send("complete", { post });
      } catch (error) {
        if (error instanceof BlogPipelineError) {
          send("error", {
            error: error.message,
            stage: error.stage,
          });
        } else {
          console.error("Unexpected blog generator error:", error);
          send("error", {
            error: "Unexpected server error.",
            stage: "server",
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
