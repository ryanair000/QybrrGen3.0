import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/lib/sanity/config";

export interface GeneratedArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GeneratedArticle {
  title: string;
  subtitle: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  imageSearchTerms?: string[];
  imagePrompt: string;
  imageAlt: string;
  sections: GeneratedArticleSection[];
  conclusionParagraphs: string[];
  tweetThread: string[];
}

export interface PublishedBlogPost {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  postUrl: string;
  studioUrl: string;
  publishedAt: string;
}

export type BlogPipelineStage =
  | "configuration"
  | "article_generation"
  | "article_parsing"
  | "image_generation"
  | "sanity_upload"
  | "sanity_publish";

export class BlogPipelineError extends Error {
  stage: BlogPipelineStage;
  status: number;

  constructor(stage: BlogPipelineStage, message: string, status = 500) {
    super(message);
    this.name = "BlogPipelineError";
    this.stage = stage;
    this.status = status;
  }
}

export type PipelineProgressCallback = (
  stage: BlogPipelineStage,
  status: "started" | "completed" | "failed",
  detail?: string
) => void;

interface GenerateAndPublishOptions {
  prompt: string;
  requestedByEmail: string;
  onProgress?: PipelineProgressCallback;
}

interface UploadedImageAsset {
  assetId: string;
  imageUrl: string | null;
}

type PortableTextSpan = {
  _key: string;
  _type: "span";
  marks: string[];
  text: string;
};

type PortableTextBlock = {
  _key: string;
  _type: "block";
  children: PortableTextSpan[];
  markDefs: unknown[];
  style: "normal" | "h2";
  listItem?: "bullet";
  level?: number;
};

function createKey() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

function requireEnv(name: string, stage: BlogPipelineStage = "configuration") {
  const value = process.env[name];

  if (!value) {
    throw new BlogPipelineError(stage, `${name} is not configured.`, 500);
  }

  return value;
}

function readFirstEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function toHttpBaseUrl(raw: string) {
  return raw
    .replace(/^ws:\/\//i, "http://")
    .replace(/^wss:\/\//i, "https://")
    .replace(/\/+$/, "");
}

function resolveOpenClawGatewayBaseUrl(stage: BlogPipelineStage) {
  const raw = readFirstEnv([
    "OPENCLAW_URL",
    "OPENCLAW_GATEWAY_URL",
    "OPENCLOW_GATEWAY_URL",
  ]);

  if (!raw) {
    throw new BlogPipelineError(
      stage,
      "OPENCLAW_URL or OPENCLAW_GATEWAY_URL is not configured.",
      500
    );
  }

  return toHttpBaseUrl(raw);
}

function resolveOpenClawImageBaseUrl(stage: BlogPipelineStage) {
  const raw = readFirstEnv([
    "OPENCLAW_IMAGE_URL",
    "OPENCLAW_IMAGE_BASE_URL",
    "OPENCLAW_URL",
    "OPENCLAW_GATEWAY_URL",
    "OPENCLOW_GATEWAY_URL",
  ]);

  if (!raw) {
    throw new BlogPipelineError(
      stage,
      "OPENCLAW_IMAGE_URL or OPENCLAW_GATEWAY_URL is not configured.",
      500
    );
  }

  return toHttpBaseUrl(raw);
}

function resolveOpenClawToken(stage: BlogPipelineStage) {
  const token = readFirstEnv([
    "OPENCLAW_TOKEN",
    "OPENCLAW_GATEWAY_TOKEN",
    "OPENCLOW_GATEWAY_TOKEN",
  ]);

  if (!token) {
    throw new BlogPipelineError(
      stage,
      "OPENCLAW_TOKEN or OPENCLAW_GATEWAY_TOKEN is not configured.",
      500
    );
  }

  return token;
}

function resolveOpenClawAgentId() {
  return readFirstEnv(["OPENCLAW_AGENT", "OPENCLOW_AGENT"]) || "main";
}

function resolveOpenClawChatModel() {
  return readFirstEnv(["OPENCLAW_MODEL"]) || `openclaw:${resolveOpenClawAgentId()}`;
}

function resolveOpenClawImageModel() {
  return (
    readFirstEnv(["OPENCLAW_IMAGE_MODEL", "OPENCLAW_MODEL"]) ||
    `openclaw:${resolveOpenClawAgentId()}`
  );
}

function buildOpenClawHeaders(stage: BlogPipelineStage, options?: { includeAgentId?: boolean }) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${resolveOpenClawToken(stage)}`,
  };
  const scopes = readFirstEnv(["OPENCLAW_SCOPES", "OPENCLOW_SCOPES"]) || "operator.write";

  if (scopes) {
    headers["x-openclaw-scopes"] = scopes;
  }

  if (options?.includeAgentId !== false) {
    headers["x-openclaw-agent-id"] = resolveOpenClawAgentId();
  }

  return headers;
}

function getSiteBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SANITY_STUDIO_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  return raw.replace(/\/+$/, "");
}

function createSanityWriteClient() {
  const token = requireEnv("SANITY_API_TOKEN");

  if (!projectId) {
    throw new BlogPipelineError(
      "configuration",
      "Sanity project id is not configured.",
      500
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
}

function normalizePrompt(prompt: string) {
  const normalized = prompt.replace(/\s+/g, " ").trim();

  if (normalized.length < 12) {
    throw new BlogPipelineError(
      "article_generation",
      "Please provide a more detailed blog idea before publishing.",
      400
    );
  }

  return normalized;
}

function extractTextContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map(item => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object" && "text" in item) {
          return typeof item.text === "string" ? item.text : "";
        }

        return "";
      })
      .join("");
  }

  return "";
}

async function callOpenClaw(prompt: string, requestedByEmail: string) {
  const baseUrl = resolveOpenClawGatewayBaseUrl("article_generation");
  const model = resolveOpenClawChatModel();

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: buildOpenClawHeaders("article_generation"),
    body: JSON.stringify({
      model,
      user: requestedByEmail,
      messages: [
        {
          role: "system",
          content:
            "You are a senior B2B technology editor for QybrrLabs. Return only valid JSON with no markdown fences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new BlogPipelineError(
      "article_generation",
      data?.error?.message ||
        data?.error ||
        `OpenClaw request failed with status ${response.status}.`,
      502
    );
  }

  const text = extractTextContent(data?.choices?.[0]?.message?.content);
  if (!text) {
    throw new BlogPipelineError(
      "article_generation",
      "OpenClaw did not return article content.",
      502
    );
  }

  return text;
}

function parseJsonPayload<T>(raw: string) {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new BlogPipelineError(
        "article_parsing",
        "The article response was not valid JSON.",
        502
      );
    }

    try {
      return JSON.parse(match[0]) as T;
    } catch {
      throw new BlogPipelineError(
        "article_parsing",
        "The article response could not be parsed into the expected structure.",
        502
      );
    }
  }
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BlogPipelineError(
      "article_parsing",
      `The generated article is missing a valid ${field}.`,
      502
    );
  }

  return value.trim();
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeArticle(raw: unknown): GeneratedArticle {
  if (!raw || typeof raw !== "object") {
    throw new BlogPipelineError(
      "article_parsing",
      "The article payload is empty.",
      502
    );
  }

  const article = raw as Record<string, unknown>;
  const sections = Array.isArray(article.sections) ? article.sections : [];

  const normalizedSections = sections
    .map(section => {
      if (!section || typeof section !== "object") {
        return null;
      }

      const value = section as Record<string, unknown>;
      const paragraphs = readStringArray(value.paragraphs);
      const bullets = readStringArray(value.bullets);

      if (paragraphs.length === 0 && bullets.length === 0) {
        return null;
      }

      return {
        heading:
          typeof value.heading === "string" ? value.heading.trim() : "",
        paragraphs,
        ...(bullets.length > 0 ? { bullets } : {}),
      } satisfies GeneratedArticleSection;
    })
    .filter(Boolean) as GeneratedArticleSection[];

  if (normalizedSections.length === 0) {
    throw new BlogPipelineError(
      "article_parsing",
      "The generated article does not include any usable sections.",
      502
    );
  }

  const conclusionParagraphs = readStringArray(article.conclusionParagraphs);
  if (conclusionParagraphs.length === 0) {
    throw new BlogPipelineError(
      "article_parsing",
      "The generated article is missing a conclusion.",
      502
    );
  }

  return {
    title: readRequiredString(article.title, "title"),
    subtitle: readRequiredString(article.subtitle, "subtitle"),
    excerpt: readRequiredString(article.excerpt, "excerpt"),
    metaDescription: readRequiredString(
      article.metaDescription,
      "metaDescription"
    ).slice(0, 160),
    keywords: readStringArray(article.keywords).slice(0, 8),
    imagePrompt: readRequiredString(article.imagePrompt, "imagePrompt"),
    imageAlt: readRequiredString(article.imageAlt, "imageAlt"),
    sections: normalizedSections,
    conclusionParagraphs,
    tweetThread: readStringArray(article.tweetThread).slice(0, 5),
  };
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `post-${createKey()}`;
}

async function ensureUniqueSlug(client: ReturnType<typeof createSanityWriteClient>, title: string) {
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]._id`,
      { slug: candidate }
    );

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function createSpan(text: string): PortableTextSpan {
  return {
    _key: createKey(),
    _type: "span",
    marks: [],
    text,
  };
}

function createBlock(
  text: string,
  options: Pick<PortableTextBlock, "style" | "listItem" | "level">
): PortableTextBlock {
  return {
    _key: createKey(),
    _type: "block",
    children: [createSpan(text)],
    markDefs: [],
    style: options.style,
    ...(options.listItem ? { listItem: options.listItem } : {}),
    ...(options.level ? { level: options.level } : {}),
  };
}

function articleToPortableText(article: GeneratedArticle) {
  const blocks: PortableTextBlock[] = [];

  article.sections.forEach(section => {
    if (section.heading) {
      blocks.push(createBlock(section.heading, { style: "h2" }));
    }

    section.paragraphs.forEach(paragraph => {
      blocks.push(createBlock(paragraph, { style: "normal" }));
    });

    section.bullets?.forEach(bullet => {
      blocks.push(
        createBlock(bullet, {
          style: "normal",
          listItem: "bullet",
          level: 1,
        })
      );
    });
  });

  blocks.push(createBlock("Conclusion", { style: "h2" }));
  article.conclusionParagraphs.forEach(paragraph => {
    blocks.push(createBlock(paragraph, { style: "normal" }));
  });

  return blocks;
}

function buildArticleGenerationPrompt(prompt: string) {
  return `You are writing for the QybrrLabs engineering blog. QybrrLabs is a technology company that builds AI agents, developer tools, and intelligent automation systems. The audience is software engineers, AI practitioners, and technical leaders.

Create a publish-ready technical blog article from the following idea.

Return only valid JSON with this exact shape:
{
  "title": "SEO-ready title",
  "subtitle": "One-sentence subtitle",
  "excerpt": "1-2 sentence excerpt under 220 characters",
  "metaDescription": "SEO description under 160 characters",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "imageSearchTerms": ["concise tech search term 1", "concise tech search term 2"],
  "imagePrompt": "Detailed editorial hero image prompt suitable for an AI image generator",
  "imageAlt": "Concise alt text for the hero image",
  "sections": [
    {
      "heading": "Section heading or empty string for intro",
      "paragraphs": ["Paragraph one", "Paragraph two"],
      "bullets": ["Optional bullet", "Optional bullet"]
    }
  ],
  "conclusionParagraphs": ["Closing paragraph", "Optional closing paragraph"],
  "tweetThread": ["Tweet 1", "Tweet 2", "Tweet 3"]
}

Rules:
- Write with deep technical authority. Include concrete architecture decisions, code-level reasoning, API design patterns, or system design trade-offs where relevant.
- Reference real-world tools, frameworks, protocols, and libraries by name. Do not be vague or generic.
- Write a substantial article, roughly 1500-2200 words with real depth.
- Include 5-7 main sections plus a conclusion.
- Each section should have at least 2-3 paragraphs with genuine technical insight, not surface-level summaries.
- Use bullets only for lists of concrete items (e.g., API parameters, configuration options, architecture components).
- Keep paragraphs clean plain text with no markdown syntax.
- Keywords must include 5 specific, SEO-relevant terms for AI/engineering audiences.
- imageSearchTerms must be 2 short phrases (2-3 words each) that would return relevant tech/AI/code/engineering stock photos. Examples: "AI neural network", "code editor dark", "server architecture", "robot automation". Never use generic terms like "business meeting" or "office".
- The imagePrompt must describe a landscape editorial hero image with a strong focal subject, safe center composition for a 16:9 crop, and no text overlays or watermarks.
- The tweetThread must contain exactly 3 tweets.

BLOG IDEA:
${prompt}`;
}

async function generateArticle(prompt: string, requestedByEmail: string) {
  const text = await callOpenClaw(
    buildArticleGenerationPrompt(prompt),
    requestedByEmail
  );
  return normalizeArticle(parseJsonPayload(text));
}

async function fetchImageBufferFromUrl(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new BlogPipelineError(
      "image_generation",
      `Failed to download generated image from ${url}.`,
      502
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

async function searchPexels(query: string): Promise<string | null> {
  const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`;
  const response = await fetch(searchUrl, {
    headers: { Authorization: process.env.PEXELS_API_KEY || "" },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  const photos = data?.photos;
  if (!Array.isArray(photos) || photos.length === 0) return null;

  const pick = photos[Math.floor(Math.random() * photos.length)];
  return pick?.src?.landscape || pick?.src?.large || null;
}

async function generateHeroImage(
  article: GeneratedArticle,
  _requestedByEmail: string
) {
  let imageDownloadUrl: string | null = null;

  // Priority 1: Use the AI-generated imageSearchTerms (designed for stock photo relevance)
  if (article.imageSearchTerms?.length) {
    for (const term of article.imageSearchTerms) {
      imageDownloadUrl = await searchPexels(term);
      if (imageDownloadUrl) break;
    }
  }

  // Priority 2: Try tech-oriented keyword combinations
  if (!imageDownloadUrl && article.keywords?.length) {
    const techTerms = article.keywords
      .filter(k => /ai|agent|code|api|dev|cloud|data|ml|llm|auto|robot|neural|model|deploy/i.test(k))
      .slice(0, 2);
    if (techTerms.length > 0) {
      imageDownloadUrl = await searchPexels(techTerms.join(" "));
    }
  }

  // Priority 3: Generic tech fallback
  if (!imageDownloadUrl) {
    const fallbackQueries = [
      "artificial intelligence technology",
      "code programming dark",
      "server data center",
      "futuristic technology abstract",
    ];
    const fallback = fallbackQueries[Math.floor(Math.random() * fallbackQueries.length)];
    imageDownloadUrl = await searchPexels(fallback);
  }

  // Priority 4: Lorem Picsum as last resort
  if (!imageDownloadUrl) {
    imageDownloadUrl = `https://picsum.photos/1600/900?random=${Date.now()}`;
  }

  const imageResponse = await fetch(imageDownloadUrl, {
    cache: "no-store",
    redirect: "follow",
  });

  if (!imageResponse.ok) {
    throw new BlogPipelineError(
      "image_generation",
      `Failed to download hero image (status ${imageResponse.status}).`,
      502
    );
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());

  if (buffer.length < 1024) {
    throw new BlogPipelineError(
      "image_generation",
      "Downloaded image was unexpectedly small.",
      502
    );
  }

  return buffer;
}

async function uploadImageToSanity(
  client: ReturnType<typeof createSanityWriteClient>,
  slug: string,
  imageBuffer: Buffer
): Promise<UploadedImageAsset> {
  try {
    const asset = await client.assets.upload("image", imageBuffer, {
      filename: `${slug}.jpg`,
      contentType: "image/jpeg",
    });

    return {
      assetId: asset._id,
      imageUrl: asset.url || null,
    };
  } catch (error) {
    throw new BlogPipelineError(
      "sanity_upload",
      error instanceof Error ? error.message : "Failed to upload image to Sanity.",
      502
    );
  }
}

async function createPublishedPost(
  client: ReturnType<typeof createSanityWriteClient>,
  article: GeneratedArticle,
  sourcePrompt: string,
  imageAsset: UploadedImageAsset
): Promise<PublishedBlogPost> {
  const slug = await ensureUniqueSlug(client, article.title);
  const documentId = `post-${randomUUID()}`;
  const publishedAt = new Date().toISOString();

  const document: Record<string, unknown> = {
    _id: documentId,
    _type: "post",
    title: article.title,
    subtitle: article.subtitle,
    slug: {
      _type: "slug",
      current: slug,
    },
    excerpt: article.excerpt,
    metaDescription: article.metaDescription,
    keywords: article.keywords,
    tweetThread: article.tweetThread,
    sourcePrompt,
    imagePrompt: article.imagePrompt,
    aiGenerated: true,
    publishedAt,
    body: articleToPortableText(article),
    mainImage: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: imageAsset.assetId,
      },
      alt: article.imageAlt,
    },
  };

  const defaultAuthorId = process.env.SANITY_DEFAULT_AUTHOR_ID?.trim();
  if (defaultAuthorId) {
    document.author = {
      _type: "reference",
      _ref: defaultAuthorId,
    };
  }

  try {
    await client.create(document as any);
  } catch (error) {
    throw new BlogPipelineError(
      "sanity_publish",
      error instanceof Error ? error.message : "Failed to create the Sanity post.",
      502
    );
  }

  const siteBaseUrl = getSiteBaseUrl();
  return {
    documentId,
    title: article.title,
    slug,
    excerpt: article.excerpt,
    imageUrl: imageAsset.imageUrl,
    postUrl: `${siteBaseUrl}/post/${slug}`,
    studioUrl: `${siteBaseUrl}/studio/intent/edit/id=${documentId};type=post`,
    publishedAt,
  };
}

function revalidatePublishedPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/post/${slug}`);
  revalidatePath("/api/rss");
}

export async function generateAndPublishBlog({
  prompt,
  requestedByEmail,
  onProgress,
}: GenerateAndPublishOptions) {
  const emit = onProgress || (() => {});

  emit("configuration", "started", "Validating configuration");
  const normalizedPrompt = normalizePrompt(prompt);
  const client = createSanityWriteClient();
  emit("configuration", "completed", "Configuration ready");

  emit("article_generation", "started", "Generating article via OpenClaw");
  const article = await generateArticle(normalizedPrompt, requestedByEmail);
  emit("article_generation", "completed", `Article generated: "${article.title}"`);

  emit("article_parsing", "started", "Parsing article structure");
  const slug = slugify(article.title);
  emit("article_parsing", "completed", `Parsed ${article.sections.length} sections`);

  emit("image_generation", "started", "Searching for relevant hero image");
  const imageBuffer = await generateHeroImage(article, requestedByEmail);
  emit("image_generation", "completed", `Hero image found (${Math.round(imageBuffer.length / 1024)}KB)`);

  emit("sanity_upload", "started", "Uploading image to Sanity");
  const uploadedImage = await uploadImageToSanity(client, slug, imageBuffer);
  emit("sanity_upload", "completed", "Image uploaded to Sanity CDN");

  emit("sanity_publish", "started", "Creating and publishing post");
  const publishedPost = await createPublishedPost(
    client,
    article,
    normalizedPrompt,
    uploadedImage
  );
  revalidatePublishedPaths(publishedPost.slug);
  emit("sanity_publish", "completed", `Published at /post/${publishedPost.slug}`);

  return publishedPost;
}



