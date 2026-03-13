"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#f1f5f9",
                borderRadius: "8px",
                border: "1px solid #334155",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#f1f5f9" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" },
              },
            }}
          />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
