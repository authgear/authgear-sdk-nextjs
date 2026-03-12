import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig } from "../types.js";
import { handleLogin } from "./login.js";
import { handleCallback } from "./callback.js";
import { handleLogout } from "./logout.js";
import { handleRefresh } from "./refresh.js";
import { handleUserInfo } from "./userinfo.js";

/**
 * Creates Next.js route handlers for all Authgear auth endpoints.
 *
 * Usage in `app/api/auth/[...authgear]/route.ts`:
 * ```ts
 * import { createAuthgearHandlers } from "@authgear/nextjs";
 * export const { GET, POST } = createAuthgearHandlers(config);
 * ```
 *
 * Routes handled:
 * - GET /api/auth/login     — Start OAuth flow
 * - GET /api/auth/callback  — Handle OAuth callback
 * - GET /api/auth/logout    — Logout and revoke tokens
 * - POST /api/auth/refresh  — Refresh access token
 * - GET /api/auth/userinfo  — Get current user info
 */
export function createAuthgearHandlers(config: AuthgearConfig) {
  async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ authgear: string[] }> },
  ): Promise<NextResponse> {
    const { authgear } = await params;
    const action = authgear?.[0];

    switch (action) {
      case "login":
        return handleLogin(request, config);
      case "callback":
        return handleCallback(request, config);
      case "logout":
        return handleLogout(request, config);
      case "userinfo":
        return handleUserInfo(request, config);
      default:
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
  }

  async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ authgear: string[] }> },
  ): Promise<NextResponse> {
    const { authgear } = await params;
    const action = authgear?.[0];

    switch (action) {
      case "refresh":
        return handleRefresh(request, config);
      default:
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
  }

  return { GET, POST };
}
