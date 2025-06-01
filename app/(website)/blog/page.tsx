import { client } from "@/lib/sanity/client";
import { postquery } from "@/lib/sanity/groq";
import Link from "next/link";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity/image";
import { format } from 'date-fns';

// Define types for our data based on the GROQ query
interface Author {
  name: string;
  image?: any; // Adjust if you have a specific type for Sanity images
}

interface Category {
  title: string;
  slug: { current: string };
}

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  author?: Author;
  mainImage?: any; // Adjust
  categories?: Category[];
  publishedAt: string;
  excerpt?: string; // From postquery
  body?: any; // Full body for detailed view, excerpt for card
}

// Re-usable BlogCard component (can be moved to its own file later)
const BlogCard = ({ post }: { post: Post }) => {
  const authorImageSrc = post.author?.image ? urlForImage(post.author.image)?.src : undefined;
  const postImageSrc = post.mainImage ? urlForImage(post.mainImage)?.src : undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300">
      {postImageSrc && (
        <Link href={`/post/${post.slug?.current}`} className="block">
          <div className="aspect-w-16 aspect-h-9">
             <Image
                src={postImageSrc}
                alt={post.title || 'Blog post image'}
                className="object-cover w-full h-full"
                width={800}
                height={450}
            />
          </div>
        </Link>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={post.publishedAt}>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</time>
          </p>
          <Link href={`/post/${post.slug?.current}`} className="mt-2 block">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400 line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          {post.author && (
            <div className="flex-shrink-0">
              <span className="sr-only">{post.author.name}</span>
              <Image
                className="h-10 w-10 rounded-full"
                src={authorImageSrc || '/avatar-placeholder.png'}
                alt={post.author.name || 'Author'}
                width={40}
                height={40}
              />
            </div>
          )}
          {post.author && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {post.author.name}
              </p>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400">Contributor</p> */}
            </div>
          )}
        </div>
        {post.categories && post.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link key={category.slug?.current} href={`/blog/category/${category.slug?.current}`}>
                <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-800 px-3 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors">
                  {category.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};


// Category Filters Component (can be moved to its own file later)
const CategoryFilters = ({ categories }: { categories: Category[] }) => {
  const allCategories = [{ title: "All Posts", slug: { current: "" } }, ...categories];
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {allCategories.map((category, index) => (
          <Link key={category.slug?.current || index} href={category.slug?.current ? `/blog/category/${category.slug?.current}` : "/blog"}>
            <span className="cursor-pointer whitespace-nowrap rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              {category.title}
              {/* Add a small 'x' if you want to make them look like dismissible tags later */}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};


export default async function BlogPage() {
  // Ensure client is not null before fetching
  if (!client) {
    console.error("Sanity client is not initialized. Cannot fetch blog posts or categories.");
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              From the Blog
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Insights, ideas, and updates from our team.
            </p>
          </div>
          <p className="text-center text-red-500 dark:text-red-400">Error: Blog content is currently unavailable. Please check back later.</p>
        </div>
      </div>
    );
  }

  // Fetch all posts
  const posts: Post[] = await client!.fetch(postquery);
  
  // Fetch all unique categories for filtering
  // Note: This query might need to be adjusted based on your exact category schema and how they are referenced in posts.
  const categoryQuery = `*[_type == "category"]{title, slug}`;
  const categories: Category[] = await client!.fetch(categoryQuery);

  // A simple function to generate an excerpt if not provided by GROQ or if it's too short
  const generateExcerpt = (body: any, length: number = 30): string => {
    if (!body) return "";
    // Assuming body is Sanity's portable text
    const plainText = body
      .filter((block: any) => block._type === 'block' && block.children)
      .map((block: any) => block.children.map((child: any) => child.text).join(''))
      .join('\\n\\n'); // Join blocks with double newline, then take first N words
    
    return plainText.split(' ').slice(0, length).join(' ') + (plainText.split(' ').length > length ? "..." : "");
  };

  const postsWithProperExcerpts = posts.map(post => ({
    ...post,
    excerpt: post.excerpt || generateExcerpt(post.body) // Use provided excerpt or generate one
  }));


  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            From the Blog
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Insights, ideas, and updates from our team.
          </p>
        </div>

        {categories.length > 0 && <CategoryFilters categories={categories} />}

        {postsWithProperExcerpts && postsWithProperExcerpts.length > 0 ? (
          <div className="mx-auto grid max-w-none grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {postsWithProperExcerpts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300">No blog posts found.</p>
        )}
      </div>
    </div>
  );
}

// Optional: Revalidate this page periodically
// export const revalidate = 60; // Revalidate every 60 seconds 