"use client";

import { AuthgearProvider } from "@authgear/nextjs/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthgearProvider>{children}</AuthgearProvider>;
}
