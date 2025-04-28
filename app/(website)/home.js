'use client';

import React from 'react';
import Image from "next/image";
// import Link from 'next/link'; // Link is likely not needed here anymore
import PostCard from '@/components/PostCard'; // Import PostCard

// Remove the placeholder posts array
// const posts = [ ... ];

// Define filters based on your Sanity category titles or add logic to fetch them
const filters = ['All', 'Music', 'Gaming', 'Graphic Design', 'Coding', 'Customer Support', 'Social Media']; // Updated the filters array

export default function HomePage({ posts: initialPosts }) { // Receive posts as initialPosts
  const [activeFilter, setActiveFilter] = React.useState('All');

  // Use initialPosts directly. Handle cases where it might be undefined or null.
  const displayPosts = initialPosts || [];

  // Filter based on Sanity category title
  const filteredPosts = displayPosts.filter(post => {
    if (activeFilter === 'All') return true;
    // Check if the post has categories and if the first category title matches
    return post?.categories?.some(cat => cat.title === activeFilter);
  });

  return (
    // Removed outer div, Header/Footer are now in layout
    // Removed Header section

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16"> {/* Kept main container padding */}
        {/* Hero Section - Updated Image */}
        <section className="mb-20 md:grid md:grid-cols-2 md:gap-12 items-center">
          <div className="mb-10 md:mb-0">
              {/* Updated heading */}
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 text-black">
                Welcome to QybrrLabs, where innovation meets AI!
              </h1>
              {/* Updated paragraph */}
              <p className="text-lg text-gray-700 mb-8">
                We're all about building next-gen SaaS solutions that supercharge your business. Our team is pushing the boundaries of what's possible with artificial intelligence to create smart, scalable tools that make things faster, easier, and more efficient. Get ready to dive into the future of tech with us!
              </p>
              {/* Changed button background to purple */}
              <a href="#" className="inline-block bg-purple-600 text-white px-5 py-2.5 rounded text-base font-medium hover:bg-purple-700 transition-colors">
                LEARN MORE
              </a>
          </div>
          <div className="relative w-full aspect-video md:aspect-auto md:h-[400px] rounded-lg overflow-hidden shadow-md">
            <Image
                src="/ai.jpg" // Updated image path
                alt="AI Hero Image" // Updated alt text
                fill
                className="object-cover"
                priority
             />
          </div>
        </section>

        {/* Filter/Tab Section - Uses the updated filters array */}
        <section className="mb-12 border-b border-gray-200">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                  activeFilter === filter
                    ? 'bg-purple-600 text-white' /* Changed active bg to purple */
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Card Grid Section */}
        <section className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 ${filteredPosts.length === 0 ? 'min-h-[200px] flex items-center justify-center' : ''}`}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              // Pass the Sanity post object to PostCard
              // PostCard is already set up to use fields like _id, title, mainImage, categories, excerpt, publishedAt
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              {displayPosts.length === 0 ? "Loading posts..." : "No posts found for this filter."}
            </p>
          )}
        </section>
      </main>

      // Removed Footer section
    // Removed closing div
  );
}
