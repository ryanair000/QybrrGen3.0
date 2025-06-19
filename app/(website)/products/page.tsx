'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { supabase } from '@/lib/supabaseClient';
import { sampleProducts } from '@/lib/products';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setSubscriptions(data.user.user_metadata.subscriptions || []);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        setSubscriptions(currentUser?.user_metadata.subscriptions || []);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleClaimTrial = async (product) => {
    if (!user) {
      toast.error('You must be logged in to claim a trial.');
      return;
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const newSubscription = {
      productId: product.id,
      name: product.name,
      status: 'trialing',
      trialEndsAt: trialEndDate.toISOString(),
    };

    const newNotification = {
      id: `trial-${product.id}-${Date.now()}`,
      type: 'info',
      message: `Your 30-day trial for ${product.name} has started.`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const currentSubscriptions = user.user_metadata.subscriptions || [];
    const currentNotifications = user.user_metadata.notifications || [];

    const { data, error } = await supabase.auth.updateUser({
      data: {
        subscriptions: [...currentSubscriptions, newSubscription],
        notifications: [...currentNotifications, newNotification],
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Trial for ${product.name} claimed!`);
      setUser(data.user);
      setSubscriptions(data.user.user_metadata.subscriptions);
    }
  };

  const isTrialActive = (productId) => {
    return subscriptions.some(sub => sub.productId === productId);
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-10 text-center">Our Products</h1>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
              data-aos="fade-up"
              data-aos-delay={Number(product.id) * 100}
            >
              <Link
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {product.stockStatus && (
                  <span className="absolute top-2 right-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 z-10">
                    {product.stockStatus}
                  </span>
                )}
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-90 lg:aspect-none lg:h-60">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-medium text-gray-800 group-hover:text-purple-600">
                    {product.name}
                  </h3>
                  {product.trialInfo && (
                    <p className="mt-1 text-sm text-blue-600 font-medium">
                      {product.trialInfo}
                    </p>
                  )}
                </div>
              </Link>

              <div className="mt-auto pt-4">
                <div className="mb-2">
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
                   {product.price === 0 && product.memberPrice !== null && product.memberPrice > 0 && (
                       <p className="text-sm text-purple-700">${product.memberPrice.toFixed(2)} for members</p>
                   )}
                   {product.price > 0 && product.memberPrice === 0 && (
                     <p className="text-sm text-purple-700">Free for members</p>
                   )}
                </div>

                {!loading && (
                  <div className="mt-2">
                    {user ? (
                      isTrialActive(product.id) ? (
                        <button
                          disabled
                          className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-md text-sm font-medium cursor-not-allowed"
                        >
                          Trial Active
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClaimTrial(product)}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          Claim 30-Day Trial
                        </button>
                      )
                    ) : (
                      <Link href="/login" className="block w-full text-center bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                          Log in to Claim
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 