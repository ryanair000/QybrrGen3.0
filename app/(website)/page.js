import HomePage from "./home";
import { getAllPosts } from "@/lib/sanity/client";

export default async function IndexPage() {
  const posts = await getAllPosts();
  return <HomePage posts={posts} />;
}

// export const revalidate = 60;
export const revalidate = 10; // Revalidate data at most every 10 seconds
