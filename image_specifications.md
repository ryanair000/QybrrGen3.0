# Blog Image Specifications

This document provides recommended dimensions (width x height in pixels) for images used on the QybrrLabs blog. Aim to upload images at these sizes or larger (maintaining aspect ratio) and leverage Next.js Image optimization or Sanity's image pipeline.

## 1. Logo (`/public/logo.png`)

-   **Header:** Aim for a height that fits the header (e.g., 40-50px). Width should scale proportionally.
    -   *Recommendation:* **~150 x 40px** (Adjust width based on your logo's aspect ratio)
-   **Footer:** Often slightly smaller than the header logo.
    -   *Recommendation:* **~120 x 32px** (Adjust width based on your logo's aspect ratio)

## 2. Hero Image (Homepage - `/public/ai.jpg`)

-   Used prominently on the homepage, often spanning half the container width on desktop.
-   Needs good resolution for larger screens.
-   *Recommendation (16:9 Aspect Ratio):* **1600 x 900px**
-   *Recommendation (4:3 Aspect Ratio):* **1600 x 1200px**
-   *(Choose one aspect ratio or size according to your design preference)*

## 3. Post Card Image (`PostCard.jsx`)

-   Displayed in a grid (up to 3 columns on desktop).
-   Needs to be clear but optimized for grid loading.
-   *Recommendation (4:3 Aspect Ratio):* **800 x 600px**
-   *Recommendation (16:9 Aspect Ratio):* **800 x 450px**
-   *(Uploading slightly larger, like 1000px wide, is also fine)*

## 4. Open Graph Image (Social Sharing)

-   Used when sharing links on social media. Specific dimensions are recommended for best display.
-   Defined in `app/(website)/layout.tsx`.
-   *Standard Recommendation:* **1200 x 630px**

## 5. Author Image (Author Profile/Schema)

-   Typically small avatars shown alongside post details or on author pages.
-   *Recommendation (Square):* **200 x 200px** (or larger if displayed bigger)

## 6. Inline Images (Blog Post Body/Content)

-   Images embedded within the main content of blog posts.
-   Size depends on whether they are intended to be full-width within the content area or smaller floats.
-   *Recommendation (for larger content images):* **1200px** width (Height proportional)

---

**Notes:**

*   **Optimization:** Always use optimized image formats (like WebP) and compression. Sanity's image pipeline and Next/Image component help significantly with this.
*   **Aspect Ratio:** Maintain the original aspect ratio unless specific cropping is intended (e.g., for square avatars).
*   **Retina Displays:** Providing images roughly 1.5x to 2x the display size accounts for high-resolution (Retina) displays. The recommendations above generally factor this in. 