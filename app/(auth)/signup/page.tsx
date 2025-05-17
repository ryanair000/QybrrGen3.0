"use client";

import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { useRouter } from 'next/navigation'; // For redirection
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Updated handleSubmit to accept email and password
  const handleSubmit = async (data: { email: string; password: string }) => {
    setError(null); // Clear previous errors
    setMessage(null);

    const { email, password } = data;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      // Supabase typically sends a confirmation email. You might want to redirect
      // to a page that tells the user to check their email.
      // options: {
      //   emailRedirectTo: `${window.location.origin}/auth/callback`, // Or your desired callback URL
      // }
    });

    if (authError) {
      console.error("Supabase signup error:", authError.message);
      setError(authError.message);
    } else if (authData.user && authData.user.identities?.length === 0) {
      // This case might indicate that email confirmation is required but the user already exists without being confirmed.
      // Or if you have email confirmation disabled, this might not be hit often.
      setMessage("User already exists but is not confirmed. Please check your email for confirmation instructions or try logging in.");
      // Supabase specific: If user exists but is unconfirmed, signUp might not error but user object is returned with no identities.
      // If identities exist, user is confirmed (or confirmation is disabled).
    } else if (authData.user) {
      // Handle successful signup
      // For example, show a message to check email for confirmation
      // Or if email confirmation is disabled, you could redirect to login or dashboard
      console.log("Signup successful, user:", authData.user);
      setMessage(
        "Signup successful! Please check your email to confirm your account."
      );
      // router.push('/login'); // Optionally redirect to login
    } else {
        // Fallback for unexpected scenarios
        setMessage("Signup initiated. If you don't receive a confirmation email, please try again or contact support.");
    }
  };

  return (
    <>
      <AuthForm formType="signup" onSubmit={handleSubmit} />
      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      {message && <p className="mt-4 text-center text-green-500">{message}</p>}
    </>
  );
} 