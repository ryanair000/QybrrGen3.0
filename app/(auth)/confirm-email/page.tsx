'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MailCheck } from 'lucide-react';

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <Link href="/">
            <Image
              src="/logo.png"
              alt="QybrrLabs Logo"
              width={150}
              height={40}
              className="mx-auto"
            />
        </Link>
        <div>
          <MailCheck className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Confirm Your Email
          </h2>
          <p className="mt-2 text-md text-gray-600">
            We&apos;ve sent a confirmation link to your email address. Please click the link to complete your registration.
          </p>
           <p className="mt-2 text-sm text-gray-500">
            (Don&apos;t forget to check your spam folder!)
          </p>
        </div>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
