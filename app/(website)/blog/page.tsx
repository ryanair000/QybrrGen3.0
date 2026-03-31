import { GlassBlogCard } from "@/components/ui/glass-blog-card-shadcnui";
import { client } from "@/lib/sanity/client";
import { postquery } from "@/lib/sanity/groq";
import Link from "next/link";
import { urlForImage } from "@/lib/sanity/image";
import { format } from "date-fns";

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

const fallbackPostImages = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
];

const defaultAuthorAvatar = "https://github.com/shadcn.png";

const getPlainTextFromPortableText = (body: any) => {
  if (!Array.isArray(body)) {
    return "";
  }

  return body
    .filter((block: any) => block?._type === "block" && Array.isArray(block.children))
    .map((block: any) =>
      block.children.map((child: any) => child?.text || "").join("")
    )
    .join(" ")
    .trim();
};

const generateExcerpt = (post: Post, length = 30) => {
  if (post.excerpt?.trim()) {
    return post.excerpt.trim();
  }

  const plainText = getPlainTextFromPortableText(post.body);
  if (!plainText) {
    return "Explore the full article for insights, ideas, and updates from QybrrLabs.";
  }

  const words = plainText.split(/\s+/).filter(Boolean);
  return `${words.slice(0, length).join(" ")}${words.length > length ? "..." : ""}`;
};

const estimateReadTime = (content: string) => {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));

  return `${minutes} min read`;
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

  const postsWithProperExcerpts = posts.map(post => ({
    ...post,
    excerpt: generateExcerpt(post),
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
          <div className="mx-auto grid max-w-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {postsWithProperExcerpts.map((post, index) => {
              const postImageSrc = post.mainImage
                ? urlForImage(post.mainImage)?.src || fallbackPostImages[index % fallbackPostImages.length]
                : fallbackPostImages[index % fallbackPostImages.length];
              const authorImageSrc = post.author?.image
                ? urlForImage(post.author.image)?.src || defaultAuthorAvatar
                : defaultAuthorAvatar;
              const publishedDate = post.publishedAt
                ? format(new Date(post.publishedAt), "MMMM d, yyyy")
                : "Coming soon";

              return (
                <GlassBlogCard
                  key={post._id}
                  title={post.title}
                  excerpt={post.excerpt}
                  image={postImageSrc}
                  author={{
                    name: post.author?.name || "QybrrLabs Team",
                    avatar: authorImageSrc,
                  }}
                  date={publishedDate}
                  readTime={estimateReadTime(post.excerpt || post.title || "")}
                  tags={
                    post.categories?.length
                      ? post.categories.map((category) => category.title).slice(0, 2)
                      : ["Insights", "QybrrLabs"]
                  }
                  href={post.slug?.current ? `/post/${post.slug.current}` : undefined}
                  className="h-full max-w-none"
                />
              );
            })}
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
