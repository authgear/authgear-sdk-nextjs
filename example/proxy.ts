import { createAuthgearProxy } from "@authgear/nextjs/proxy";
import { authgearConfig } from "@/lib/authgear";

export const proxy = createAuthgearProxy({
  ...authgearConfig,
  protectedPaths: ["/dashboard/*"],
});
