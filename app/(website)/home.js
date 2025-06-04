'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
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
                We&apos;re all about building next-gen SaaS solutions that supercharge your business. Our team is pushing the boundaries of what&apos;s possible with artificial intelligence to create smart, scalable tools that make things faster, easier, and more efficient. Get ready to dive into the future of tech with us!
              </p>
              {/* Changed button background to purple */}
              <a href="#" className="inline-block bg-purple-600 text-white px-5 py-2.5 rounded text-base font-medium hover:bg-purple-700 transition-colors">
                LEARN MORE
              </a>
          </div>
          <div className="relative w-full aspect-video md:aspect-auto md:h-[400px] rounded-lg overflow-hidden shadow-md">
            <Image
                src="/ai16.jpg" // Updated image path
                alt="AI Hero Image" // Updated alt text
                fill
                className="object-cover"
                priority
             />
          </div>
        </section>

        {/* Featured Solutions Wrapper */}
        <section className="py-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 mb-16">Featured Solutions</h2>

          {/* Original Socio Solutions Section */}
          <section id="featured-solution-socio" className="py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg mb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
              {/* Image on the left */}
              <div className="relative w-full aspect-square md:h-[350px] rounded-lg overflow-hidden shadow-lg mx-auto md:mx-0 max-w-md">
                  <Image
                      src="/socio.jpeg" // Using the Socio image
                      alt="Socio App Screenshot"
                      fill
                      className="object-cover"
                  />
              </div>
              {/* Text content on the right */}
              <div className="text-center md:text-left">
                  <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Featured Solution</h2>
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
                      Socio - Snap, Caption, Share!
                  </h3>
                  <p className="text-lg text-gray-700 mb-6">
                      Easily capture moments, generate engaging captions with AI, and share instantly. Perfect for boosting your social media presence effortlessly.
                  </p>
                   <p className="text-md text-blue-700 font-medium mb-8">
                      Free for members + 1 month trial on sign up!
                  </p>
                  <Link href="/products" className="inline-block bg-purple-600 text-white px-6 py-3 rounded text-base font-medium hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg">
                      Learn More & Get Started
                  </Link>
              </div>
            </div>
          </section>

          {/* Second Solutions Section (The Bio Chef) - Alternating layout */}
          <section id="featured-solution-biochef" className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
              {/* Text content on the left */}
              <div className="text-center md:text-left md:order-2">
                  <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Featured Solution</h2>
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
                      The Bio Chef - Your Personal Meal Planner!
                  </h3>
                  <p className="text-lg text-gray-700 mb-6">
                      Generate custom meal plans, track nutrition, and discover new recipes with AI. Achieve your health goals with ease.
                  </p>
                   <p className="text-md text-purple-700 font-medium mb-8">
                      Free for members + 7-day free trial on sign up!
                  </p>
                  <Link href="https://biochef.netlify.app/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded text-base font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                      Learn More & Get Started
                  </Link>
              </div>
              {/* Image on the right */}
              <div className="relative w-full aspect-square md:h-[350px] rounded-lg overflow-hidden shadow-lg mx-auto md:mx-0 max-w-md md:order-1">
                  <Image
                      src="/img/thebiochef.png" // Using the Bio Chef image
                      alt="The Bio Chef App Screenshot"
                      fill
                      className="object-cover"
                  />
              </div>
            </div>
          </section>
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
