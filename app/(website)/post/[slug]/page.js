import PostPage from "./default";
import { getAllPostsSlugs, getPostBySlug } from "@/lib/sanity/client";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return await getAllPostsSlugs();
}

export async function generateMetadata({ params }) {
  try {
    const post = await getPostBySlug(params.slug);
    if (!post || !post.title) {
      return { title: "Post Not Found" };
    }
    return { title: post.title };
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
