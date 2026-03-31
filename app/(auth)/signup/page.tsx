"use client";

import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm formType="signup" />
    </Suspense>
  );
} 