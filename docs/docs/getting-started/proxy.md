---
sidebar_position: 4
---

# Proxy (Route Protection)

Create a `proxy.ts` file at the root of your Next.js project to protect routes and automatically inject auth headers.

```ts title="proxy.ts"
import { createAuthgearProxy } from "@authgear/nextjs/proxy";
import { authgearConfig } from "@/lib/authgear";

export const proxy = createAuthgearProxy({
  ...authgearConfig,
  protectedPaths: ["/dashboard/*", "/profile/*"],
});
```

## What the proxy does

For every incoming request:

1. **Public paths** (default: `/api/auth/*`) — passed through immediately, no auth check
2. **Protected paths** — if the session cookie is missing or invalid, redirects to `/api/auth/login?returnTo=<path>`
3. **Authenticated requests** — injects `Authorization: Bearer <accessToken>` into request headers
4. **Expired tokens** — automatically refreshes the access token using the refresh token before continuing

## Options

| Option | Default | Description |
|---|---|---|
| `protectedPaths` | `[]` | Paths requiring auth. Supports `*` suffix (e.g. `"/dashboard/*"`) |
| `publicPaths` | `["/api/auth/*"]` | Paths always allowed through (takes precedence over `protectedPaths`) |
| `loginPath` | `"/api/auth/login"` | Where unauthenticated users are redirected |

## Using the injected header in API routes

Because the proxy sets `Authorization: Bearer <token>` on every authenticated request, your API routes can read it directly:

```ts title="app/api/data/route.ts"
export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  // token is already verified to be fresh — proxy refreshed it if needed
}
```
