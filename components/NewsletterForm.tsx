"use client";

import React, { useState } from 'react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    if (!email) {
      setMessage('Please enter your email.');
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
      console.error('Subscription error:', error);
    }
  };

  return (
    <div className="newsletter-form py-8 px-4 md:px-0">
      <div className="max-w-xl mx-auto">
        <h3 className="text-2xl font-semibold text-center mb-3 text-gray-800 dark:text-gray-100">Stay Updated</h3>
        <p className="text-gray-600 text-center mb-6 dark:text-gray-300">Subscribe to our newsletter for the latest news and offers.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-grow w-full sm:w-auto p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition duration-150 ease-in-out text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Subscribe
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-sm text-center ${message.includes('Successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsletterForm; 