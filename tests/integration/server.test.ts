import { describe, it, expect, vi, beforeEach } from "vitest";
import { clearOIDCCache } from "../../src/oauth/discovery.js";
import { encryptSession, decryptSession } from "../../src/session/cookie.js";
import type { AuthgearConfig } from "../../src/types.js";

// Must be mocked before importing server.ts (vi.mock is hoisted)
vi.mock("server-only", () => ({}));

const mockCookieSet = vi.fn();
let mockCookieJar: Record<string, string> = {};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: (name: string) => {
        const val = mockCookieJar[name];
        return val ? { value: val } : undefined;
      },
      set: mockCookieSet,
    }),
  ),
}));

const { currentUser, auth, getOpenURL } = await import("../../src/server.js");
import { SessionState } from "../../src/types.js";

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

beforeEach(() => {
  clearOIDCCache();
  mockCookieJar = {};
  mockCookieSet.mockClear();
});

describe("currentUser", () => {
  it("returns null when no session cookie", async () => {
    const user = await currentUser(CONFIG);
    expect(user).toBeNull();
  });

  it("returns user info for a valid non-expired session", async () => {
    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "valid_access_token",
        refreshToken: "valid_refresh_token",
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      },
      CONFIG.sessionSecret,
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/.well-known/openid-configuration")) {
          return new Response(JSON.stringify(MOCK_OIDC_CONFIG));
        }
        if (url.includes("/oauth2/userinfo")) {
          return new Response(
            JSON.stringify({ sub: "user-123", email: "user@example.com" }),
          );
        }
        return new Response("Not Found", { status: 404 });
      }),
    );

    const user = await currentUser(CONFIG);
    expect(user).not.toBeNull();
    expect(user?.sub).toBe("user-123");
  });

  it("refreshes expired token and persists rotated refresh token to cookie", async () => {
    const oldRefreshToken = "old_refresh_token";
    const newRefreshToken = "rotated_refresh_token";

    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "expired_access_token",
        refreshToken: oldRefreshToken,
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) - 100, // expired
      },
      CONFIG.sessionSecret,
    );

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
              refresh_token: newRefreshToken, // server rotates the refresh token
            }),
          );
        }
        if (url.includes("/oauth2/userinfo")) {
          return new Response(
            JSON.stringify({ sub: "user-123", email: "user@example.com" }),
          );
        }
        return new Response("Not Found", { status: 404 });
      }),
    );

    await currentUser(CONFIG);

    // The rotated refresh token must be persisted to the cookie
    expect(mockCookieSet).toHaveBeenCalled();
    const [cookieName, cookieValue] = mockCookieSet.mock.calls[0];
    expect(cookieName).toBe("authgear.session");

    const saved = decryptSession(cookieValue, CONFIG.sessionSecret);
    expect(saved?.refreshToken).toBe(newRefreshToken);
    expect(saved?.accessToken).toBe("new_access_token");
  });

  it("keeps old refresh token in cookie when server does not rotate", async () => {
    const oldRefreshToken = "stable_refresh_token";

    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "expired_access_token",
        refreshToken: oldRefreshToken,
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) - 100,
      },
      CONFIG.sessionSecret,
    );

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
              // no refresh_token returned — no rotation
            }),
          );
        }
        if (url.includes("/oauth2/userinfo")) {
          return new Response(
            JSON.stringify({ sub: "user-123", email: "user@example.com" }),
          );
        }
        return new Response("Not Found", { status: 404 });
      }),
    );

    await currentUser(CONFIG);

    expect(mockCookieSet).toHaveBeenCalled();
    const [, cookieValue] = mockCookieSet.mock.calls[0];
    const saved = decryptSession(cookieValue, CONFIG.sessionSecret);
    expect(saved?.refreshToken).toBe(oldRefreshToken);
  });

  it("returns null when token refresh fails", async () => {
    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "expired_access_token",
        refreshToken: "invalid_refresh_token",
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) - 100,
      },
      CONFIG.sessionSecret,
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/.well-known/openid-configuration")) {
          return new Response(JSON.stringify(MOCK_OIDC_CONFIG));
        }
        if (url.includes("/oauth2/token")) {
          return new Response(JSON.stringify({ error: "invalid_grant" }), {
            status: 400,
          });
        }
        return new Response("Not Found", { status: 404 });
      }),
    );

    const user = await currentUser(CONFIG);
    expect(user).toBeNull();
    expect(mockCookieSet).not.toHaveBeenCalled();
  });
});

describe("auth", () => {
  it("returns NoSession when no session cookie", async () => {
    const session = await auth(CONFIG);
    expect(session.state).toBe(SessionState.NoSession);
    expect(session.accessToken).toBeNull();
  });

  it("returns Authenticated with valid non-expired session", async () => {
    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "valid_access_token",
        refreshToken: "valid_refresh_token",
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      },
      CONFIG.sessionSecret,
    );

    const session = await auth(CONFIG);
    expect(session.state).toBe(SessionState.Authenticated);
    expect(session.accessToken).toBe("valid_access_token");
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it("refreshes expired token and returns new access token", async () => {
    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "expired_access_token",
        refreshToken: "valid_refresh_token",
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) - 100,
      },
      CONFIG.sessionSecret,
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/.well-known/openid-configuration")) {
          return new Response(JSON.stringify(MOCK_OIDC_CONFIG));
        }
        if (url.includes("/oauth2/token")) {
          return new Response(
            JSON.stringify({
              access_token: "refreshed_access_token",
              token_type: "Bearer",
              expires_in: 1800,
              refresh_token: "rotated_refresh_token",
            }),
          );
        }
        return new Response("Not Found", { status: 404 });
      }),
    );

    const session = await auth(CONFIG);
    expect(session.state).toBe(SessionState.Authenticated);
    // Must return the NEW access token, not the expired one
    expect(session.accessToken).toBe("refreshed_access_token");

    // Rotated refresh token must be persisted
    expect(mockCookieSet).toHaveBeenCalled();
    const [, cookieValue] = mockCookieSet.mock.calls[0];
    const saved = decryptSession(cookieValue, CONFIG.sessionSecret);
    expect(saved?.refreshToken).toBe("rotated_refresh_token");
  });

  it("returns NoSession when token refresh fails", async () => {
    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "expired_access_token",
        refreshToken: "expired_refresh_token",
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) - 100,
      },
      CONFIG.sessionSecret,
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/.well-known/openid-configuration")) {
          return new Response(JSON.stringify(MOCK_OIDC_CONFIG));
        }
        if (url.includes("/oauth2/token")) {
          return new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 });
        }
        return new Response("Not Found", { status: 404 });
      }),
    );

    const session = await auth(CONFIG);
    expect(session.state).toBe(SessionState.NoSession);
    expect(session.accessToken).toBeNull();
  });
});

describe("getOpenURL", () => {
  it("throws 'Not authenticated' when no session cookie", async () => {
    await expect(getOpenURL("/settings", CONFIG)).rejects.toThrow("Not authenticated");
  });

  it("throws 'No refresh token in session' when session has no refresh token", async () => {
    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "valid_access_token",
        refreshToken: null,
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      },
      CONFIG.sessionSecret,
    );

    await expect(getOpenURL("/settings", CONFIG)).rejects.toThrow(
      "No refresh token in session",
    );
  });

  it("returns an authorization URL with the app_session_token for the happy path", async () => {
    mockCookieJar["authgear.session"] = encryptSession(
      {
        accessToken: "valid_access_token",
        refreshToken: "valid_refresh_token",
        idToken: null,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      },
      CONFIG.sessionSecret,
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/.well-known/openid-configuration")) {
          return new Response(JSON.stringify(MOCK_OIDC_CONFIG));
        }
        if (url.includes("/oauth2/app_session_token")) {
          return new Response(
            JSON.stringify({
              app_session_token: "ast_test_token",
              expire_at: "2026-03-18T12:00:00Z",
            }),
          );
        }
        return new Response("Not Found", { status: 404 });
      }),
    );

    const url = await getOpenURL("/settings", CONFIG);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("response_type")).toBe("none");
    expect(parsed.searchParams.get("prompt")).toBe("none");
    expect(parsed.searchParams.get("client_id")).toBe(CONFIG.clientID);
    const loginHint = parsed.searchParams.get("login_hint") ?? "";
    expect(loginHint).toContain("type=app_session_token");
    expect(loginHint).toContain(encodeURIComponent("ast_test_token"));
  });
});
