import Image from "next/image";
import Link from "next/link";
import Container from "@/components/container";
import { notFound } from "next/navigation";
import { PortableText } from "@/lib/sanity/plugins/portabletext";
import { urlForImage } from "@/lib/sanity/image";
import { parseISO, format } from "date-fns";

import CategoryLabel from "@/components/blog/category";
import AuthorCard from "@/components/blog/authorCard";

export default function Post(props) {
  const { loading, post } = props;

  const slug = post?.slug;

  if (!loading && (!slug || !post)) {
    notFound();
  }

  // Additional safeguard against incomplete post data
  if (!post || !post.title) {
    return (
      <Container>
        <div className="mx-auto max-w-screen-md text-center py-20">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Post data is incomplete or unavailable
          </h1>
          <div className="mt-10">
            <Link 
              href="/"
              className="bg-brand-secondary/20 rounded-full px-5 py-2 text-sm text-blue-600 dark:text-blue-500">
              ← Return to homepage
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const imageProps = post?.mainImage
    ? urlForImage(post?.mainImage)
    : null;

  const AuthorimageProps = post?.author?.image
    ? urlForImage(post.author.image)
    : null;

  // Format date safely
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMMM dd, yyyy");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Publication date unavailable";
    }
  };

  return (
    <>
      <Container className="!pt-0">
        <div className="mx-auto max-w-screen-md ">
          <div className="flex justify-center">
            {post.categories && post.categories.length > 0 && (
              <CategoryLabel categories={post.categories} />
            )}
          </div>

          <h1 className="text-brand-primary mb-4 mt-2 text-center text-3xl font-semibold tracking-tight dark:text-white lg:text-4xl lg:leading-snug">
            {post.title}
          </h1>

          <div className="mt-3 flex items-center justify-center space-x-3 text-gray-500 ">
            {post.author && (
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex-shrink-0">
                  {AuthorimageProps && (
                    <Link href={`/author/${post.author.slug?.current || '#'}`}>
                      <Image
                        src={AuthorimageProps.src}
                        alt={post?.author?.name || "Author"}
                        className="rounded-full object-cover"
                        fill
                        sizes="40px"
                      />
                    </Link>
                  )}
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-800 dark:text-gray-400">
                    <Link href={`/author/${post.author.slug?.current || '#'}`}>
                      {post.author.name}
                    </Link>
                  </span>
                  <span className="ml-2 flex items-center space-x-2">
                    <time
                      className="text-gray-500 dark:text-gray-400"
                      dateTime={post?.publishedAt || post._createdAt}>
                      {formatDate(post?.publishedAt || post._createdAt)}
                    </time>
                    <span className="text-gray-500 dark:text-gray-400">· {post.estReadingTime || "5"} min read</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      <div className="relative z-0 mx-auto aspect-video max-w-screen-lg overflow-hidden lg:rounded-lg">
        {imageProps && (
          <Image
            src={imageProps.src}
            alt={post.mainImage?.alt || "Thumbnail"}
            loading="eager"
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
      </div>

      <Container>
        <article className="mx-auto max-w-screen-md ">
          <div className="prose mx-auto my-3 dark:prose-invert prose-a:text-blue-600">
            {post.body && <PortableText value={post.body} />}
          </div>
          <div className="mb-7 mt-7 flex justify-center">
            <Link
              href="/"
              className="bg-brand-secondary/20 rounded-full px-5 py-2 text-sm text-blue-600 dark:text-blue-500 ">
              ← View all posts
            </Link>
          </div>
          {post.author && <AuthorCard author={post.author} />}
        </article>
      </Container>
    </>
  );
}

const MainImage = ({ image }) => {
  return (
    <div className="mb-12 mt-12 ">
      <Image {...urlForImage(image)} alt={image.alt || "Thumbnail"} />
      <figcaption className="text-center ">
        {image.caption && (
          <span className="text-sm italic text-gray-600 dark:text-gray-400">
            {image.caption}
          </span>
        )}
      </figcaption>
    </div>
  );
};
