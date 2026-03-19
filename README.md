# Authgear SDK for Next.js

[![@authgear/nextjs](https://img.shields.io/npm/v/@authgear/nextjs.svg?label=@authgear/nextjs)](https://www.npmjs.com/package/@authgear/nextjs)
[![@authgear/nextjs](https://img.shields.io/npm/dt/@authgear/nextjs.svg?label=@authgear/nextjs)](https://www.npmjs.com/package/@authgear/nextjs)
![License](https://img.shields.io/badge/license-MIT-blue)

With Authgear SDK for Next.js, you can easily integrate authentication features into your Next.js application — covering both the frontend and backend in one package.
In most cases, it involves just **a few lines of code** to enable **multiple authentication methods**, such as [social logins](https://www.authgear.com/features/social-login), [passwordless](https://www.authgear.com/features/passwordless-authentication), [biometrics logins](https://www.authgear.com/features/biometric-authentication), [one-time-password (OTP)](https://www.authgear.com/features/whatsapp-otp) with SMS/WhatsApp, and multi-factor authentication (MFA).

**Quick links** — 📚 [Documentation](https://authgear.github.io/authgear-sdk-nextjs/) · 🏁 [Getting Started](#getting-started) · 🛠️ [Troubleshooting](#troubleshooting) · 👥 [Contributing](#contributing)

## What is Authgear?

[Authgear](https://www.authgear.com/) is a highly adaptable identity-as-a-service (IDaaS) platform for web and mobile applications.
Authgear makes user authentication easier and faster to implement by integrating it into various types of applications — from single-page web apps to mobile applications to API services.

### Key Features

- Zero-trust authentication architecture with [OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) standard.
- Easy-to-use interfaces for user registration and login, including email, phone, username as login ID, and password, OTP, magic links, etc.
- Support for a wide range of identity providers, such as [Google](https://developers.google.com/identity), [Apple](https://support.apple.com/en-gb/guide/deployment/depa64848f3a/web), and [Azure Active Directory](https://azure.microsoft.com/en-gb/products/active-directory/).
- Support for Passkeys, biometric login, and Multi-Factor Authentication (MFA) such as SMS/email-based verification and authenticator apps with TOTP.

## Requirements

- **Next.js** >= 16.0.0
- **React** >= 19.0.0
- **Node.js** >= 18

## Installation

```sh
npm install @authgear/nextjs
```

## Getting Started

For a complete tutorial, see the [Next.js integration guide](https://docs.authgear.com/get-started/regular-web-app/nextjs) on Authgear Docs, or explore the [example project](https://github.com/authgear/authgear-example-nextjs) on GitHub.

### 1. Configure Authgear

Create a config object. The `sessionSecret` must be at least 32 characters and should be stored in an environment variable.

```ts
// lib/authgear.ts
import type { AuthgearConfig } from "@authgear/nextjs";

export const authgearConfig: AuthgearConfig = {
  endpoint: process.env.AUTHGEAR_ENDPOINT!,       // e.g. "https://myapp.authgear.cloud"
  clientID: process.env.AUTHGEAR_CLIENT_ID!,
  redirectURI: process.env.AUTHGEAR_REDIRECT_URI!,   // e.g. "http://localhost:3000/api/auth/callback"
  sessionSecret: process.env.SESSION_SECRET!,         // min 32 chars
};
```

### 2. Add the Route Handler

Create a catch-all route to handle all auth endpoints (`/api/auth/login`, `/api/auth/callback`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/userinfo`).

```ts
// app/api/auth/[...authgear]/route.ts
import { createAuthgearHandlers } from "@authgear/nextjs";
import { authgearConfig } from "@/lib/authgear";

export const { GET, POST } = createAuthgearHandlers(authgearConfig);
```

### 3. Add the Provider (Client Components)

Wrap your app with `AuthgearProvider` to enable client-side hooks and components.

```tsx
// app/layout.tsx
import { AuthgearProvider } from "@authgear/nextjs/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthgearProvider>{children}</AuthgearProvider>
      </body>
    </html>
  );
}
```

### 4. Protect Routes with the Proxy (Next.js 16)

Create a `proxy.ts` file at the root of your project to automatically redirect unauthenticated users and inject auth headers.

```ts
// proxy.ts
import { createAuthgearProxy } from "@authgear/nextjs/proxy";
import { authgearConfig } from "@/lib/authgear";

export const proxy = createAuthgearProxy({
  ...authgearConfig,
  protectedPaths: ["/dashboard/*", "/profile/*"],
});
```

---

## Usage

### Client Components

Use the `useAuthgear` hook or the built-in buttons:

```tsx
"use client";

import { useAuthgear, SignInButton, SignOutButton } from "@authgear/nextjs/client";

export function NavBar() {
  const { isAuthenticated, isLoaded, user } = useAuthgear();

  if (!isLoaded) return null;

  return isAuthenticated ? (
    <div>
      <span>Welcome, {user?.email}</span>
      <SignOutButton />
    </div>
  ) : (
    <SignInButton />
  );
}
```

### Server Components

Use `currentUser()` to get the authenticated user in Server Components and Route Handlers.

```tsx
// app/dashboard/page.tsx
import { currentUser } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser(authgearConfig);
  if (!user) redirect("/api/auth/login?returnTo=/dashboard");

  return <h1>Hello, {user.email}</h1>;
}
```

### Protecting API Routes with JWT

Use `verifyAccessToken()` to validate a Bearer token in API routes.

```ts
// app/api/me/route.ts
import { verifyAccessToken } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const payload = await verifyAccessToken(token, authgearConfig);
    return NextResponse.json({ sub: payload.sub });
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
}
```

### Reading the Session in Server Actions

Use `auth()` to get the session (including a fresh access token) without fetching user info. This is the right choice for Server Actions that need to call a downstream API on behalf of the user — `auth()` will auto-refresh the token if expired before returning it.

```ts
"use server";
import { auth, SessionState } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";

export async function callMyApiAction() {
  const session = await auth(authgearConfig);
  if (session.state !== SessionState.Authenticated || !session.accessToken) {
    throw new Error("Not authenticated");
  }

  // session.accessToken is always fresh — auto-refreshed if it was expired
  const res = await fetch("https://api.example.com/data", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  return res.json();
}
```

---

## API Reference

### `@authgear/nextjs`

| Export | Description |
|---|---|
| `createAuthgearHandlers(config)` | Returns `{ GET, POST }` for `app/api/auth/[...authgear]/route.ts` |

### `@authgear/nextjs/server`

| Export | Description |
|---|---|
| `auth(config)` | Returns the current `Session`, auto-refreshes access token if expired |
| `currentUser(config)` | Returns `UserInfo \| null`, auto-refreshes access token if expired |
| `verifyAccessToken(token, config)` | Verifies a JWT Bearer token with JWKS, returns `JWTPayload` |
| `getOpenURL(page, config)` | Returns a URL to open an Authgear page (e.g. `Page.Settings`) with the user pre-authenticated |

### `@authgear/nextjs/client`

| Export | Description |
|---|---|
| `<AuthgearProvider>` | React context provider, must wrap the app |
| `useAuthgear()` | Returns `{ state, user, isLoaded, isAuthenticated, signIn, signOut }` |
| `useUser()` | Returns `UserInfo \| null` |
| `<SignInButton>` | Button that calls `signIn()` on click |
| `<SignOutButton>` | Button that calls `signOut()` on click |

### `@authgear/nextjs/proxy`

| Export | Description |
|---|---|
| `createAuthgearProxy(options)` | Returns a Next.js 16 `proxy()` function |

**`createAuthgearProxy` options** (extends `AuthgearConfig`):

| Option | Default | Description |
|---|---|---|
| `protectedPaths` | `[]` | Paths requiring auth, supports `*` suffix (e.g. `"/dashboard/*"`) |
| `publicPaths` | `["/api/auth/*"]` | Paths always allowed through |
| `loginPath` | `"/api/auth/login"` | Where to redirect unauthenticated users |

### `AuthgearConfig`

| Field | Required | Description |
|---|---|---|
| `endpoint` | ✓ | Authgear endpoint, e.g. `"https://myapp.authgear.cloud"` |
| `clientID` | ✓ | OAuth client ID |
| `redirectURI` | ✓ | OAuth callback URL, e.g. `"http://localhost:3000/api/auth/callback"` |
| `sessionSecret` | ✓ | Secret for encrypting session cookie (min 32 chars) |
| `postLogoutRedirectURI` | | Where to redirect after logout. Defaults to `"/"` |
| `scopes` | | OAuth scopes. Defaults to `["openid", "offline_access", "https://authgear.com/scopes/full-userinfo"]` |
| `cookieName` | | Session cookie name. Defaults to `"authgear.session"` |

---

## Roadmap

This SDK is actively maintained. Feature requests and contributions are welcome via [GitHub Issues](https://github.com/authgear/authgear-sdk-nextjs/issues).

---

## Documentation

- **SDK Documentation**: [https://authgear.github.io/authgear-sdk-nextjs/](https://authgear.github.io/authgear-sdk-nextjs/)
- Learn how to set up an Authgear application at [https://docs.authgear.com/](https://docs.authgear.com/)
- Learn how to manage your users through the [Admin API](https://docs.authgear.com/reference/apis/admin-api)

## Troubleshooting

Please check out the [Get Help](https://github.com/orgs/authgear/discussions/categories/get-help) section for solutions to common issues.

### Raise an Issue

To provide feedback or report a bug, please [raise an issue on our issue tracker](https://github.com/authgear/authgear-sdk-js/issues).

## Contributing

Anyone who wishes to contribute to this project, whether documentation, features, bug fixes, code cleanup, testing, or code reviews, is very much encouraged to do so.

To join, raise your hand on the [Authgear Discord server](https://discord.gg/Kdn5vcYwAS) or the GitHub [discussions board](https://github.com/orgs/authgear/discussions).

```sh
git clone git@github.com:authgear/authgear-sdk-nextjs.git
cd authgear-sdk-nextjs
npm install
npm test
```

## Supported and maintained by

<div align="center">
  <a href="https://github.com/authgear"><img src="https://uploads-ssl.webflow.com/60658b46b03f0cf83ac1485d/619e6607eb647619cecee2cf_authgear-logo.svg" /></a>
</div>

<p align="center">
  Authgear is a highly adaptable identity-as-a-service (IDaaS) platform for web and mobile applications. To learn more, visit <a href="https://www.authgear.com/">authgear.com</a>.
</p>
