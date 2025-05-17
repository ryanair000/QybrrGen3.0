"use client";

import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { useRouter } from 'next/navigation'; // For redirection
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Updated handleSubmit to accept email and password
  const handleSubmit = async (data: { email: string; password: string }) => {
    setError(null); // Clear previous errors
    const { email, password } = data;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      console.error("Supabase login error:", signInError.message);
      setError(signInError.message);
    } else {
      // Handle successful login
      // User session is now managed by Supabase. 
      // You might want to redirect to a dashboard or protected route.
      console.log("Login successful!");
      router.push('/'); // Redirect to homepage after successful login
      // router.refresh(); // Uncomment if you need to refresh server components or layout data
    }
  };

  return (
    <>
      <AuthForm formType="login" onSubmit={handleSubmit} />
      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </>
  );
} 