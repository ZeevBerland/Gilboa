"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode, useRef } from "react";

// Lazy-initialize the client inside the component so the module can be
// imported during SSR / static-page generation without crashing when
// NEXT_PUBLIC_CONVEX_URL is not yet available.
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const clientRef = useRef<ConvexReactClient | null>(null);

  if (clientRef.current === null) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error(
        "Missing NEXT_PUBLIC_CONVEX_URL environment variable. " +
          "Set it in your Vercel project settings or in .env.local for local development."
      );
    }
    clientRef.current = new ConvexReactClient(url);
  }

  return (
    <ConvexAuthProvider client={clientRef.current}>
      {children}
    </ConvexAuthProvider>
  );
}
