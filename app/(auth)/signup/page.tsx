"use client";

import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { useRouter } from 'next/navigation';


export default function SignupPage() {
  const router = useRouter();

  const handleSubmit = async (data: { email: string; password: string }) => {
    const { email, password } = data;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // For now, we'll just log the error. You might want to display this to the user.
      console.error("Supabase signup error:", error.message);
    } else {
      // Redirect to the confirmation page on successful signup
      router.push('/confirm-email');
    }
  };

  return (
    <>
      <AuthForm formType="signup" onSubmit={handleSubmit} />
    </>
  );
} 