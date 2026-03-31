import PostPage from "./default";
import { getAllPostsSlugs, getPostBySlug } from "@/lib/sanity/client";
import { notFound } from "next/navigation";
import { urlForImage } from "@/lib/sanity/image";

export async function generateStaticParams() {
  return await getAllPostsSlugs();
}

export async function generateMetadata({ params }) {
  try {
    const post = await getPostBySlug(params.slug);
    if (!post || !post.title) {
      return { title: "Post Not Found" };
    }

    const description = post.metaDescription || post.excerpt || undefined;
    const image = post.mainImage ? urlForImage(post.mainImage) : undefined;

    return {
      title: post.title,
      description,
      openGraph: {
        title: post.title,
        description,
        ...(image
          ? {
              images: [
                {
                  url: image.src,
                  width: image.width,
                  height: image.height,
                  alt: post.mainImage?.alt || post.title,
                },
              ],
            }
          : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "Error Loading Post" };
  }
}

export default async function PostDefault({ params }) {
  try {
    const post = await getPostBySlug(params.slug);
    if (!post || Object.keys(post).length === 0) {
      notFound();
    }
    return <PostPage post={post} />;
  } catch (error) {
    console.error("Error loading post:", error);
    notFound();
  }
}

// Enable Incremental Static Regeneration
export const revalidate = 60;
