"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}
