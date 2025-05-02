import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/lib/sanity/image"; // Helper to get image URLs
import { format } from 'date-fns'; // For formatting dates

// Define the structure of a Post (adjust based on your Sanity schema)
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any; // Adjust type if needed
  publishedAt: string;
  excerpt?: string; // Optional excerpt
  // Add other fields you need, e.g., author, categories
}

// GROQ query to fetch posts - adjust fields as needed
const postsQuery = groq`*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  "excerpt": pt::text(body[0..1]), // Basic text excerpt from body (customize as needed)
  // Add other fields here
}`;

// Helper function to generate post URL
const postUrl = (slug: string) => `/blog/${slug}`;

export default async function BlogPage() {
  // Fetch posts from Sanity only if client exists
  const posts: Post[] = client ? await client.fetch(postsQuery) : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-12 text-center">Qybrr Labs Blog</h1>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              // Generate image data *before* rendering
              const imageProps = post.mainImage ? urlForImage(post.mainImage) : undefined;

              return (
                <Link key={post._id} href={postUrl(post.slug.current)} className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {/* Post Image - Conditionally render based on imageProps */}
                  {imageProps?.src && (
                    <div className="relative w-full h-48 sm:h-56 bg-gray-200">
                      <Image
                        src={imageProps.src} // Use the src from the helper function result
                        alt={post.title || 'Blog post image'}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                        // Optionally pass width/height if not using layout='fill'
                        // width={imageProps.width}
                        // height={imageProps.height}
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-5">
                    <p className="text-sm text-gray-500 mb-2">
                      {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                    </p>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-purple-700 line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="text-sm font-medium text-purple-600 group-hover:underline">
                      Read more &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600">No blog posts found.</p>
        )}
      </div>
    </div>
  );
}

// Revalidate the page every 60 seconds (optional)
export const revalidate = 60; 