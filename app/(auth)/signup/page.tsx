"use client";

import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();

  const handleSubmit = async (data: { email: string; password: string }) => {
    const { email, password } = data;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      console.error("Supabase signup error:", authError.message);
      toast.error(authError.message);
    } else if (authData.user && authData.user.identities?.length === 0) {
      toast.error("User already exists but is not confirmed. Please check your email.");
    } else if (authData.user) {
      console.log("Signup successful, user:", authData.user);
      toast.success("Signup successful! Please check your email to confirm your account.");
      router.push('/confirm-email');
    } else {
      toast.error("Signup initiated. If you don't receive a confirmation email, please try again.");
    }
  };

  return (
    <>
      <AuthForm formType="signup" onSubmit={handleSubmit} />
    </>
  );
} 