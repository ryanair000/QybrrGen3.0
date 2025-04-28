import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link

// Utility function to get the Sanity image URL (optional, but good practice)
// You might have this utility already defined elsewhere
// import { urlForImage } from '@/lib/sanity/image';

export default function PostCard({ post }) {
  // Destructure or access properties safely
  const title = post?.title || 'Untitled';
  const description = post?.excerpt || post?.description || ''; // Use excerpt first
  const imageUrl = post?.mainImage?.asset?.url || post?.imageUrl || '/placeholder-card.png'; // Add a fallback placeholder
  const tag = post?.categories?.[0]?.title || post?.tag || 'Misc'; // Use category first
  const date = post?.publishedAt || post?.date;
  const slug = post?.slug?.current || post?.id || '#'; // Link to post detail page

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No date';

  return (
    // Wrap card in Link to make it clickable
    <Link href={`/post/${slug}`} className="bg-white rounded-lg overflow-hidden flex flex-col group border border-gray-200 transition-all duration-300 hover:border-gray-300">
      {/* Card Image */}
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          // src={urlForImage(post.mainImage).height(300).width(500).url()} // Example using urlForImage utility
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
        />
        {/* Tag */}
        <span className="absolute top-3 left-3 bg-white text-black text-[11px] font-semibold px-1.5 py-0.5 rounded shadow-sm z-10">
          {tag}
        </span>
      </div>
      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 text-black">
          {title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-3">
          {description}
        </p>
        <p className="text-xs text-gray-400 mt-auto">
          {formattedDate}
        </p>
      </div>
    </Link>
  );
} 