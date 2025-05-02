'use client'; // Keep client directive for potential future interactivity

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Optional: if cards link somewhere

// Sample Product Data - Replace with your actual data source later
const sampleProducts = [
  {
    id: '1',
    name: 'Socio - Snap, Caption, Share!',
    imageUrl: '/socio.jpeg',
    price: 5,
    memberPrice: 0,
    stockStatus: null,
    href: 'https://stately-zuccutto-85f0f7.netlify.app/',
    trialInfo: '1 month trial on sign up'
  },
  {
    id: '2',
    name: 'Taiwan Coloring Page!',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Coloring+Page', // Placeholder
    price: 2,
    memberPrice: 0,
    stockStatus: null,
    href: '#'
  },
  {
    id: '3',
    name: 'FREE Jungle Wallpaper!',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Jungle+Wallpaper', // Placeholder
    price: 0,
    memberPrice: null,
    stockStatus: null,
    href: '#'
  },
  {
    id: '4',
    name: 'Custom Photo Illustration',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Photo+Illustration', // Placeholder
    price: 25,
    memberPrice: 15,
    stockStatus: 'Only 5 left',
    href: '#'
  },
  {
    id: '5',
    name: 'Send a card & a sticker to a friend!',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Card+%26+Sticker', // Placeholder
    price: 15,
    memberPrice: 12,
    stockStatus: 'Only 5 left',
    href: '#'
  },
  {
    id: '6',
    name: 'Commission a hand-drawn GIF',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Hand+Drawn+GIF', // Placeholder
    price: 15,
    memberPrice: 10,
    stockStatus: 'Only 3 left',
    href: '#'
  },
  // Add more sample products if needed
];

export default function ProductsPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-10 text-center">Our Products</h1>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {sampleProducts.map((product) => (
            <Link key={product.id} href={product.href} className="group block bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative">
              {/* Stock Status Badge */}
              {product.stockStatus && (
                <span className="absolute top-2 right-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 z-10">
                  {product.stockStatus}
                </span>
              )}

              {/* Product Image */}
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-90 lg:aspect-none lg:h-60">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={400} // Adjust intrinsic width
                  height={300} // Adjust intrinsic height
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>

              {/* Product Details */}
              <div className="mt-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-800 group-hover:text-purple-600">
                    {product.name}
                  </h3>
                  {/* Display Trial Info if available */}
                  {product.trialInfo && (
                    <p className="mt-1 text-sm text-blue-600 font-medium">
                      {product.trialInfo}
                    </p>
                  )}
                </div>
                <div className="mt-2">
                  {product.price > 0 ? (
                     <p className="text-lg font-semibold text-gray-900">
                        {product.memberPrice !== null && product.memberPrice < product.price ? (
                            <>
                                <span className="text-gray-500 line-through mr-2">${product.price.toFixed(2)}</span>
                                <span className="text-purple-700">${product.memberPrice.toFixed(2)} for members</span>
                            </>
                        ) : (
                           `$${product.price.toFixed(2)}`
                        )}
                     </p>
                   ) : (
                     <p className="text-lg font-semibold text-green-600">Free</p>
                   )}

                  {/* Explicit member price display if regular price is 0 but member price is not */}
                   {product.price === 0 && product.memberPrice !== null && product.memberPrice > 0 && (
                       <p className="text-sm text-purple-700">${product.memberPrice.toFixed(2)} for members</p>
                   )}
                    {/* Show 0$ member price if applicable */}
                   {product.price > 0 && product.memberPrice === 0 && (
                     <p className="text-sm text-purple-700">Free for members</p>
                   )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 