"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { sampleProducts } from '@/lib/products';

interface AuthFormProps {
  formType: "login" | "signup";
}

export default function AuthForm({ formType }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isLogin = formType === "login";

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);

      const subscriptions = sampleProducts.map(product => ({
        productId: product.id,
        name: product.name,
        status: 'trialing',
        trialEndsAt: trialEndDate.toISOString(),
      }));

      const notifications = [
        {
          id: `trial-${Date.now()}`,
          type: 'info',
          message: `Welcome! Your 30-day free trial for all products has started.`,
          read: false,
          createdAt: new Date().toISOString(),
        }
      ];

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            subscriptions: subscriptions,
            notifications: notifications,
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        router.push("/confirm-email");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden max-w-4xl w-full">
      {/* Left Column: Form */}
      <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white">
        <div className="mb-10">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="QybrrLabs Logo" width={240} height={240} className="h-40 w-auto" />
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex">
            <Link
              href="/login"
              className={`pb-3 px-1 mr-6 text-sm font-medium focus:outline-none transition-colors duration-150
                ${isLogin
                  ? "border-b-2 border-gray-800 text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={`pb-3 px-1 text-sm font-medium focus:outline-none transition-colors duration-150
                ${!isLogin
                  ? "border-b-2 border-gray-800 text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Create account
            </Link>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}
          {!isLogin && (
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Username*
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Email*
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 sm:text-sm bg-white text-gray-900"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Password*
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 sm:text-sm bg-white text-gray-900"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Confirm Password*
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Keep me logged in on this device
                </label>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              {isLogin ? "Log in" : "Create account"}
            </button>
          </div>
        </form>

        {isLogin && (
            <div className="mt-8 text-center">
            <div className="text-sm">
                <Link
                href="#"
                className="font-medium text-gray-500 hover:text-gray-600"
                >
                I forgot my password
                </Link>
            </div>
            </div>
        )}

      </div>

      {/* Right Column: Image */}
      <div className="hidden md:block md:w-1/2 h-auto md:h-full">
        <Image
          src="/gp.jpg"
          alt="Illustration for authentication page"
          width={800}
          height={1200}
          className="object-cover h-full w-full"
          priority
        />
      </div>
    </div>
  );
} 