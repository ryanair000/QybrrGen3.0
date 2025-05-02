'use client'; // Keep client directive if using client-side features like state for mobile menu eventually

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image

export default function Header() {
  // Add state for mobile menu toggle later
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-6">
          {/* Use Image component for the logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png" // Path relative to /public
              alt="QybrrLabs Logo"
              width={150} // Adjust width as needed
              height={40} // Adjust height as needed
              priority // Prioritize loading logo
              className="h-auto" // Maintain aspect ratio
            />
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-5">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-purple-600">
              HOME
            </Link>
            {/* Placeholder Dropdown Links */}
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-purple-600 flex items-center space-x-1">
              <span>SOLUTIONS</span><span>&#x25BC;</span>
            </a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-purple-600">
              DOCS
            </a>
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-purple-600">
              PRODUCTS
            </Link>
            <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-purple-600">
              BLOG
            </Link>
          </div>
        </div>
        {/* Right side actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="http://localhost:3001/login" className="text-sm font-medium text-gray-700 hover:text-purple-600">
            LOG IN
          </Link>
          <Link href="http://localhost:3001/login" className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-purple-700 transition-colors">
            SIGN UP
          </Link>
        </div>
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            // onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Add toggle logic later
            className="text-gray-600 hover:text-purple-600 p-2 -mr-2" // Added padding for easier tapping
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
      {/* Mobile Menu Panel (conditionally rendered) - Add later */}
      {/* {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            Mobile nav links here
          </div>
        </div>
      )} */}
    </header>
  );
} 