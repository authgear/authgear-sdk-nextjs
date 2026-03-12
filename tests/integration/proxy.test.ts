import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthgearProxy } from "../../src/proxy.js";
import { clearOIDCCache } from "../../src/oauth/discovery.js";
import { encryptSession } from "../../src/session/cookie.js";
import type { AuthgearConfig } from "../../src/types.js";

const CONFIG: AuthgearConfig = {
  endpoint: "https://test.authgear.cloud",
  clientID: "test-client-id",
  redirectURI: "http://localhost:3000/api/auth/callback",
  sessionSecret: "a-super-secret-key-that-is-at-least-32-chars",
};

const MOCK_OIDC_CONFIG = {
  authorization_endpoint: "https://test.authgear.cloud/oauth2/authorize",
  token_endpoint: "https://test.authgear.cloud/oauth2/token",
  userinfo_endpoint: "https://test.authgear.cloud/oauth2/userinfo",
  revocation_endpoint: "https://test.authgear.cloud/oauth2/revoke",
  end_session_endpoint: "https://test.authgear.cloud/oauth2/logout",
  jwks_uri: "https://test.authgear.cloud/oauth2/jwks",
  issuer: "https://test.authgear.cloud",
};

function makeNextRequest(url: string, cookies: Record<string, string> = {}) {
  const req = new Request(url) as any;
  Object.defineProperty(req, "nextUrl", { get: () => new URL(url) });
  Object.defineProperty(req, "cookies", {
    get: () => ({
      get: (name: string) => {
        const val = cookies[name];
        return val ? { value: val } : undefined;
      },
    }),
  });
  return req;
}

beforeEach(() => {
  clearOIDCCache();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.includes("/.well-known/openid-configuration")) {
        return new Response(JSON.stringify(MOCK_OIDC_CONFIG));
      }
      if (url.includes("/oauth2/token")) {
        return new Response(
          JSON.stringify({
            access_token: "new_access_token",
            token_type: "Bearer",
            expires_in: 1800,
            refresh_token: "new_refresh_token",
          }),
        );
      }
      return new Response("Not Found", { status: 404 });
    }),
  );
});

describe("createAuthgearProxy", () => {
  it("allows public paths without authentication", async () => {
    const proxy = createAuthgearProxy({
      ...CONFIG,
      protectedPaths: ["/dashboard/*"],
    });

    const req = makeNextRequest("http://localhost:3000/api/auth/login");
    const res = await proxy(req);
    // Should pass through (NextResponse.next()) not redirect
    expect(res.status).not.toBe(307);
  });

  it("redirects unauthenticated requests to protected paths", async () => {
    const proxy = createAuthgearProxy({
      ...CONFIG,
      protectedPaths: ["/dashboard/*"],
    });

    const req = makeNextRequest("http://localhost:3000/dashboard/home");
    const res = await proxy(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/api/auth/login");
    expect(location).toContain("returnTo=%2Fdashboard%2Fhome");
  });

  it("allows authenticated requests to protected paths", async () => {
    const proxy = createAuthgearProxy({
      ...CONFIG,
      protectedPaths: ["/dashboard/*"],
    });

    const sessionData = encryptSession(
      {
        accessToken: "valid_access_token",
        refreshToken: "valid_refresh_token",
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      },
      CONFIG.sessionSecret,
    );

    const req = makeNextRequest("http://localhost:3000/dashboard/home", {
      "authgear.session": sessionData,
    });
    const res = await proxy(req);
    expect(res.status).not.toBe(307);
  });

  it("auto-refreshes expired tokens", async () => {
    const proxy = createAuthgearProxy({ ...CONFIG });

    const sessionData = encryptSession(
      {
        accessToken: "expired_access_token",
        refreshToken: "valid_refresh_token",
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) - 100, // expired
      },
      CONFIG.sessionSecret,
    );

    const req = makeNextRequest("http://localhost:3000/some-page", {
      "authgear.session": sessionData,
    });
    const res = await proxy(req);

    // Should update the session cookie with new tokens
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("authgear.session");
  });
});
