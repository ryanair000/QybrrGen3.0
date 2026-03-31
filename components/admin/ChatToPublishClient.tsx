"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { PromptInputBox } from "./PromptInputBox";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface PublishedPostResult {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  postUrl: string;
  studioUrl: string;
  publishedAt: string;
}

interface ActivityEntry {
  id: string;
  stage: string;
  status: "started" | "completed" | "failed";
  detail: string;
  timestamp: number;
}

interface ChatToPublishClientProps {
  embedded?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Stage label map                                                   */
/* ------------------------------------------------------------------ */
const STAGE_LABELS: Record<string, string> = {
  configuration: "Configuration",
  article_generation: "Article Generation",
  article_parsing: "Article Parsing",
  image_generation: "Hero Image",
  sanity_upload: "Image Upload",
  sanity_publish: "Publish to Sanity",
};

/* ------------------------------------------------------------------ */
/*  Activity Log Item                                                 */
/* ------------------------------------------------------------------ */
function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const label = STAGE_LABELS[entry.stage] || entry.stage;

  return (
    <div className="flex items-start gap-3 py-2 px-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="mt-0.5 flex-shrink-0">
        {entry.status === "started" && (
          <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />
        )}
        {entry.status === "completed" && (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        )}
        {entry.status === "failed" && (
          <XCircle className="h-4 w-4 text-red-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200">{label}</span>
          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
              entry.status === "started"
                ? "bg-sky-500/10 text-sky-400"
                : entry.status === "completed"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {entry.status}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{entry.detail}</p>
      </div>
      <span className="text-[10px] text-gray-500 font-mono flex-shrink-0 mt-1">
        {new Date(entry.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */
export default function ChatToPublishClient({
  embedded = false,
}: ChatToPublishClientProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{
    message: string;
    stage?: string;
  } | null>(null);
  const [result, setResult] = useState<PublishedPostResult | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const activityEndRef = useRef<HTMLDivElement>(null);

  const addActivity = useCallback(
    (stage: string, status: string, detail: string, timestamp: number) => {
      setActivity((prev) => {
        // If this is a "completed" or "failed" for a stage, update the existing "started" entry
        if (status !== "started") {
          const updated = prev.map((a) =>
            a.stage === stage && a.status === "started"
              ? { ...a, status: status as ActivityEntry["status"], detail, timestamp }
              : a
          );
          // If no match found, append
          if (updated.every((a) => !(a.stage === stage && a.status === status))) {
            return [
              ...updated,
              {
                id: `${stage}-${status}-${timestamp}`,
                stage,
                status: status as ActivityEntry["status"],
                detail,
                timestamp,
              },
            ];
          }
          return updated;
        }
        return [
          ...prev,
          {
            id: `${stage}-${status}-${timestamp}`,
            stage,
            status: status as ActivityEntry["status"],
            detail,
            timestamp,
          },
        ];
      });

      // Auto-scroll
      setTimeout(() => {
        activityEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    },
    []
  );

  async function handleSend(message: string) {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;

    setError(null);
    setResult(null);
    setActivity([]);
    setSubmitting(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const response = await fetch("/api/admin/blog-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
        signal: abort.signal,
      });

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (currentEvent === "progress") {
              addActivity(
                data.stage,
                data.status,
                data.detail || "",
                data.timestamp || Date.now()
              );
            } else if (currentEvent === "complete") {
              setResult(data.post || null);
            } else if (currentEvent === "error") {
              setError({
                message: data.error || "Publishing failed.",
                stage: data.stage,
              });
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError({
          message:
            err instanceof Error ? err.message : "Publishing failed.",
          stage: "network",
        });
      }
    } finally {
      setSubmitting(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setSubmitting(false);
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
              <span className="text-sm font-bold">Q</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                QybrrLabs Blog Publisher
              </h1>
              <p className="text-xs text-gray-500">
                Chat idea → AI article → hero image → published
              </p>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        {activity.length > 0 && (
          <div className="mb-6 rounded-2xl border border-[#1e1e2a] bg-[#111118] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e1e2a] flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  submitting ? "bg-sky-400 animate-pulse" : result ? "bg-emerald-400" : error ? "bg-red-400" : "bg-gray-500"
                }`}
              />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Pipeline Activity
              </span>
              {submitting && (
                <span className="text-[10px] text-sky-400 ml-auto font-mono">
                  Processing...
                </span>
              )}
            </div>
            <div className="px-3 py-2 max-h-[280px] overflow-y-auto divide-y divide-[#1e1e2a]/50">
              {activity.map((entry) => (
                <ActivityItem key={entry.id} entry={entry} />
              ))}
              <div ref={activityEndRef} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-red-400">
              {error.stage
                ? `${error.stage.replace(/_/g, " ")} error`
                : "Publish error"}
            </p>
            <p className="mt-1 text-sm text-red-300/80">{error.message}</p>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                  Published
                </span>
              </div>
              <h2 className="text-xl font-semibold text-white">
                {result.title}
              </h2>
              <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
                {result.excerpt}
              </p>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-[1.3fr,1fr]">
              <div className="space-y-3">
                {/* Links */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={result.postUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
                  >
                    View post
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={result.studioUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#333] px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-[#555] hover:text-white"
                  >
                    Open in Studio
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => copyUrl(result.postUrl)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#333] px-3 py-2 text-sm text-gray-400 transition hover:border-[#555] hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider">
                      Slug
                    </span>
                    <p className="mt-0.5 text-gray-300 font-mono">
                      {result.slug}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider">
                      Published
                    </span>
                    <p className="mt-0.5 text-gray-300">
                      {new Date(result.publishedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Image preview */}
              <div className="overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#111118]">
                {result.imageUrl ? (
                  <div className="relative aspect-[3/2]">
                    <Image
                      src={result.imageUrl}
                      alt={result.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[3/2] items-center justify-center text-center text-xs text-gray-500">
                    No hero image
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="sticky bottom-4">
          <PromptInputBox
            onSend={handleSend}
            isLoading={submitting}
            onStop={handleStop}
            placeholder="Describe the blog post you want to publish..."
          />
          <p className="mt-2 text-center text-[11px] text-gray-600">
            Generates article via OpenClaw, fetches a relevant hero image, and
            publishes directly to Sanity.
          </p>
        </div>
      </div>
    </div>
  );
}
