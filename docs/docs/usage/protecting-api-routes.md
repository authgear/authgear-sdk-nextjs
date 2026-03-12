---
sidebar_position: 3
---

# Protecting API Routes

Use `verifyAccessToken` to validate a Bearer token in Route Handlers.

```ts title="app/api/me/route.ts"
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const payload = await verifyAccessToken(token, authgearConfig);
    return NextResponse.json({ sub: payload.sub, email: payload.email });
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
}
```

`verifyAccessToken` fetches the JWKS from Authgear (cached for 1 hour), verifies the RS256 signature, and checks `exp`, `iss`, and `aud`.

## JWTPayload fields

| Field | Type | Description |
|---|---|---|
| `sub` | `string` | Subject (user ID) |
| `iss` | `string` | Issuer — your Authgear endpoint |
| `aud` | `string \| string[]` | Audience — your client ID |
| `exp` | `number` | Expiry (Unix timestamp) |
| `iat` | `number` | Issued at (Unix timestamp) |
| `client_id` | `string?` | OAuth client ID |
| `roles` | `string[]?` | `https://authgear.com/claims/user/roles` |
| `[key]` | `unknown` | Any additional claims |

## Calling the API from a Server Action

When the proxy is active it injects the Authorization header for page requests, but not for direct `fetch()` calls. Use a Server Action to forward the session token:

```ts title="app/dashboard/actions.ts"
"use server";

import { auth, SessionState } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";
import { headers } from "next/headers";

export async function callMeAction() {
  const session = await auth(authgearConfig);
  if (session.state !== SessionState.Authenticated || !session.accessToken) {
    throw new Error("Not authenticated");
  }

  const host = (await headers()).get("host") ?? "localhost:3000";
  const baseUrl = host.startsWith("localhost") ? `http://${host}` : `https://${host}`;

  const res = await fetch(`${baseUrl}/api/me`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  return res.json();
}
```
