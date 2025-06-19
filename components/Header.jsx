'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="QybrrLabs Logo"
              width={150}
              height={40}
              priority
              className="h-auto"
            />
          </Link>
          <div className="hidden md:flex items-center space-x-5">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-purple-600">
              HOME
            </Link>
            <Link href="/#featured-solution" className="text-sm font-medium text-gray-700 hover:text-purple-600 flex items-center space-x-1">
              <span>SOLUTIONS</span><span>&#x25BC;</span>
            </Link>
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
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-48 animate-pulse bg-gray-200 rounded-md"></div>
          ) : user ? (
            <>
              <span className="text-sm font-medium text-gray-700">
                Welcome, {user.user_metadata.username || user.email}
              </span>
              <Link href="/account" className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-purple-700 transition-colors">
                MY ACCOUNT
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-purple-600">
                LOG IN
              </Link>
              <Link href="/signup" className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-purple-700 transition-colors">
                SIGN UP
              </Link>
            </>
          )}
        </div>
        <div className="md:hidden flex items-center">
          <button
            className="text-gray-600 hover:text-purple-600 p-2 -mr-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
} 