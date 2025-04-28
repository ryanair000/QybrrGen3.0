import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Use Image component for the logo */}
          <Link href="/" className="flex items-center">
             <Image
                src="/logo.png" // Path relative to /public
                alt="QybrrLabs Logo"
                width={120} // Adjust width as needed (maybe smaller than header)
                height={32} // Adjust height as needed
                className="h-auto" // Maintain aspect ratio
              />
          </Link>
        </div>
        <div className="text-sm text-gray-600">
          curated by <a href="#" className="font-semibold text-gray-800 hover:underline">Mobbin</a>
        </div>
      </div>
    </footer>
  );
} 