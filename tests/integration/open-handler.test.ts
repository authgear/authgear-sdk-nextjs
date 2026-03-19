import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleOpen } from "../../src/handlers/open.js";
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

// Always defines req.cookies — returns undefined for absent cookie names.
function makeNextRequest(url: string, cookies: Record<string, string> = {}) {
  const req = new Request(url) as any;
  Object.defineProperty(req, "nextUrl", { get: () => new URL(url) });
  Object.defineProperty(req, "cookies", {
    get: () => ({
      get: (name: string) => {
        const val = cookies[name];
        return val !== undefined ? { value: val } : undefined;
      },
    }),
  });
  return req;
}

function makeSession(overrides: Record<string, unknown> = {}) {
  return encryptSession(
    {
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: null,
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      ...overrides,
    },
    CONFIG.sessionSecret,
  );
}

beforeEach(() => {
  clearOIDCCache();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.includes("/.well-known/openid-configuration")) {
        return new Response(JSON.stringify(MOCK_OIDC_CONFIG));
      }
      if (url.includes("/oauth2/app_session_token")) {
        // getAppSessionToken reads json.result — the server wraps the token in { result: ... }
        return new Response(
          JSON.stringify({
            result: {
              app_session_token: "mock_app_session_token",
              expire_at: "2099-01-01T00:00:00Z",
            },
          }),
        );
      }
      return new Response("Not Found", { status: 404 });
    }),
  );
});

describe("handleOpen", () => {
  it("returns 400 when page param is missing", async () => {
    const req = makeNextRequest("http://localhost:3000/api/auth/open");
    const res = await handleOpen(req, CONFIG);
    expect(res.status).toBe(400);
  });

  it("returns 400 when page param is not a known Page value", async () => {
    const req = makeNextRequest("http://localhost:3000/api/auth/open?page=/evil");
    const res = await handleOpen(req, CONFIG);
    expect(res.status).toBe(400);
  });

  it("returns 401 when no session cookie", async () => {
    const req = makeNextRequest("http://localhost:3000/api/auth/open?page=/settings");
    const res = await handleOpen(req, CONFIG);
    expect(res.status).toBe(401);
  });

  it("returns 401 when session cookie is corrupt/undecryptable", async () => {
    const req = makeNextRequest("http://localhost:3000/api/auth/open?page=/settings", {
      "authgear.session": "not-valid-base64url-garbage",
    });
    const res = await handleOpen(req, CONFIG);
    expect(res.status).toBe(401);
  });

  it("returns 401 when session has no refresh token", async () => {
    const session = makeSession({ refreshToken: null });
    const req = makeNextRequest("http://localhost:3000/api/auth/open?page=/settings", {
      "authgear.session": session,
    });
    const res = await handleOpen(req, CONFIG);
    expect(res.status).toBe(401);
  });

  it("returns 401 when app session token exchange fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/.well-known/openid-configuration")) {
          return new Response(JSON.stringify(MOCK_OIDC_CONFIG));
        }
        if (url.includes("/oauth2/app_session_token")) {
          return new Response("Unauthorized", { status: 401 });
        }
        return new Response("Not Found", { status: 404 });
      }),
    );
    const session = makeSession();
    const req = makeNextRequest("http://localhost:3000/api/auth/open?page=/settings", {
      "authgear.session": session,
    });
    const res = await handleOpen(req, CONFIG);
    expect(res.status).toBe(401);
  });

  it("redirects to Authgear authorize URL for /settings", async () => {
    const session = makeSession();
    const req = makeNextRequest("http://localhost:3000/api/auth/open?page=/settings", {
      "authgear.session": session,
    });
    const res = await handleOpen(req, CONFIG);
    expect(res.status).toBe(302);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("https://test.authgear.cloud/oauth2/authorize");
    expect(location).toContain(encodeURIComponent("/settings"));
    expect(location).toContain("mock_app_session_token");
  });
});
