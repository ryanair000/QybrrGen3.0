# Chat-To-Publish Blog Generator Status

Last updated: March 31, 2026

## What We Have Achieved

- Built a single chat-to-publish blog workflow inside `QybrrGen3.0`.
- Added a standalone generator page at `/admin/blog-generator`.
- Added a matching Sanity Studio entry so the same generator UI can be opened from Studio.
- Removed auth from the flow for now, so the generator can be used directly without Supabase sign-in.
- Implemented a shared server-side publishing pipeline for:
  - prompt normalization
  - article generation
  - structured article parsing
  - Portable Text conversion
  - Sanity document creation
  - immediate publish
  - route revalidation
- Extended the Sanity `post` schema with AI publishing fields such as:
  - `subtitle`
  - `metaDescription`
  - `keywords`
  - `tweetThread`
  - `sourcePrompt`
  - `imagePrompt`
  - `aiGenerated`
- Updated post rendering and metadata so generated content displays correctly on the site.
- Updated RSS generation to use the generated metadata more cleanly.
- Wired the generator to the live app URL:
  - Site: `https://summary.3.148.181.102.sslip.io`
- Wired the text-generation side to the live OpenClaw gateway:
  - OpenClaw: `https://opclaw.3.148.181.102.sslip.io`
- Added compatibility handling so the pipeline can work with gateway-style OpenClaw environment variables.

## What We Verified

- The generator page loads locally at `http://localhost:3001/admin/blog-generator`.
- The generator API health route responds successfully.
- The live OpenClaw gateway is reachable from the app.
- OpenClaw chat completion requests succeed against the live gateway when sent with the required operator scopes.
- A live publish attempt now gets past:
  - local app boot
  - no-auth access
  - Sanity project configuration
  - OpenClaw article generation

## Current Blocker

The remaining blocker is the image-generation step.

Current failure:

```json
{
  "error": "The configured OpenClaw gateway does not expose /v1/images/generations. Set OPENCLAW_IMAGE_URL or OPENCLAW_IMAGE_BASE_URL to a compatible image-generation service in your pipeline.",
  "stage": "image_generation"
}
```

## What This Means

- The text side of the pipeline is working.
- The publish flow is reaching the image step correctly.
- The current OpenClaw gateway deployment does not expose the image-generation endpoint the blog pipeline is expecting.
- We need the dedicated image-generation URL from your pipeline, or we need to expose a compatible image endpoint behind OpenClaw.

## Next Step To Unblock

Provide one of the following:

1. A live image endpoint URL for your OpenClaw pipeline.
2. A separate image service base URL that supports an OpenAI-style image generation request.
3. The exact request/response shape used by your image worker if it is not OpenAI-compatible.

Once that is available, we can set:

- `OPENCLAW_IMAGE_URL`, or
- `OPENCLAW_IMAGE_BASE_URL`

and run a full end-to-end publish test.

## End State After Unblocking

Once the image endpoint is connected, the intended flow is:

1. Enter a blog idea in the chat generator.
2. Generate a structured article through OpenClaw.
3. Generate a hero image through the image pipeline.
4. Upload the image to Sanity.
5. Create and publish the post immediately.
6. Revalidate the homepage, blog listing, post page, and RSS feed.

