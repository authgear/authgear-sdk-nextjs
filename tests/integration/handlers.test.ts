import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleLogin } from "../../src/handlers/login.js";
import { handleCallback } from "../../src/handlers/callback.js";
import { handleLogout } from "../../src/handlers/logout.js";
import { clearOIDCCache } from "../../src/oauth/discovery.js";
import type { AuthgearConfig } from "../../src/types.js";
import { encryptSession, buildPKCECookie } from "../../src/session/cookie.js";
import { generateCodeVerifier } from "../../src/oauth/pkce.js";
import { generateState } from "../../src/oauth/authorize.js";

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

function makeRequest(url: string, cookies: Record<string, string> = {}): Request {
  const req = new Request(url);
  // Mock cookies
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  if (cookieHeader) {
    Object.defineProperty(req, "cookies", {
      get: () => ({
        get: (name: string) => {
          const val = cookies[name];
          return val ? { value: val } : undefined;
        },
      }),
    });
  } else {
    Object.defineProperty(req, "cookies", {
      get: () => ({ get: () => undefined }),
    });
  }
  // Add nextUrl
  Object.defineProperty(req, "nextUrl", { get: () => new URL(url) });
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
            access_token: "mock_access_token",
            token_type: "Bearer",
            expires_in: 1800,
            refresh_token: "mock_refresh_token",
            id_token: "mock_id_token",
          }),
        );
      }
      if (url.includes("/oauth2/revoke")) {
        return new Response("", { status: 200 });
      }
      return new Response("Not Found", { status: 404 });
    }),
  );
});

describe("handleLogin", () => {
  it("redirects to the Authgear authorization endpoint", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login");
    const res = await handleLogin(req as any, CONFIG);

    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("https://test.authgear.cloud/oauth2/authorize");
    expect(location).toContain("response_type=code");
    expect(location).toContain("client_id=test-client-id");
    expect(location).toContain("code_challenge_method=S256");
  });

  it("sets a PKCE cookie", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login");
    const res = await handleLogin(req as any, CONFIG);

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("authgear.pkce");
  });
});

describe("handleLogin — isSSOEnabled", () => {
  it("does not include prompt when isSSOEnabled is omitted (default true)", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login");
    // CONFIG has no isSSOEnabled — resolveConfig should default to true → no prompt
    const res = await handleLogin(req as any, CONFIG);
    const location = res.headers.get("location") ?? "";
    expect(location).not.toContain("prompt=");
  });

  it("does not include prompt when isSSOEnabled is explicitly true", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login");
    const res = await handleLogin(req as any, { ...CONFIG, isSSOEnabled: true });
    const location = res.headers.get("location") ?? "";
    expect(location).not.toContain("prompt=");
  });

  it("includes prompt=login when isSSOEnabled is false", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login");
    const res = await handleLogin(req as any, { ...CONFIG, isSSOEnabled: false });
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("prompt=login");
  });
});

describe("handleLogin — per-call prompt", () => {
  it("forwards ?prompt=login query param to authorize URL", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login?prompt=login");
    // CONFIG has isSSOEnabled omitted (defaults true) — no global prompt
    const res = await handleLogin(req as any, CONFIG);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("prompt=login");
  });

  it("forwards ?prompt=none query param to authorize URL", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login?prompt=none");
    const res = await handleLogin(req as any, CONFIG);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("prompt=none");
  });

  it("per-call prompt overrides isSSOEnabled: false (global)", async () => {
    // isSSOEnabled: false would add prompt=login globally, but per-call prompt=none wins
    const req = makeRequest("http://localhost:3000/api/auth/login?prompt=none");
    const res = await handleLogin(req as any, { ...CONFIG, isSSOEnabled: false });
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("prompt=none");
    expect(location).not.toContain("prompt=login");
  });

  // Regression guard — this already passes before the implementation change.
  // Verifies that existing isSSOEnabled: false behaviour is not broken by the new per-call logic.
  it("falls back to isSSOEnabled global when no per-call prompt", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/login");
    const res = await handleLogin(req as any, { ...CONFIG, isSSOEnabled: false });
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("prompt=login"); // from isSSOEnabled: false
  });
});

describe("handleCallback", () => {
  it("returns 400 when state is missing", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/callback?code=abc");
    const res = await handleCallback(req as any, CONFIG);
    expect(res.status).toBe(400);
  });

  it("returns 400 when PKCE cookie is missing", async () => {
    const req = makeRequest("http://localhost:3000/api/auth/callback?code=abc&state=xyz");
    const res = await handleCallback(req as any, CONFIG);
    expect(res.status).toBe(400);
  });

  it("returns 400 when state does not match", async () => {
    const codeVerifier = generateCodeVerifier();
    const state = generateState();
    const pkceCookie = buildPKCECookie(
      { codeVerifier, state, returnTo: "/" },
      CONFIG.sessionSecret,
    );
    const req = makeRequest(
      "http://localhost:3000/api/auth/callback?code=abc&state=WRONG_STATE",
      { "authgear.pkce": pkceCookie.value },
    );
    const res = await handleCallback(req as any, CONFIG);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_state");
  });

  it("exchanges code and sets session cookie on success", async () => {
    const codeVerifier = generateCodeVerifier();
    const state = generateState();
    const pkceCookie = buildPKCECookie(
      { codeVerifier, state, returnTo: "/" },
      CONFIG.sessionSecret,
    );
    const req = makeRequest(
      `http://localhost:3000/api/auth/callback?code=valid_code&state=${state}`,
      { "authgear.pkce": pkceCookie.value },
    );
    const res = await handleCallback(req as any, CONFIG);

    expect(res.status).toBe(307);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("authgear.session");
  });

  it("returns 400 with error from Authgear", async () => {
    const req = makeRequest(
      "http://localhost:3000/api/auth/callback?error=access_denied&error_description=User+denied",
    );
    const res = await handleCallback(req as any, CONFIG);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("access_denied");
  });
});

describe("handleLogout", () => {
  it("clears the session cookie and redirects", async () => {
    const sessionData = encryptSession(
      {
        accessToken: "at",
        refreshToken: "rt",
        idToken: null,
        expiresAt: 9999999999,
      },
      CONFIG.sessionSecret,
    );
    const req = makeRequest("http://localhost:3000/api/auth/logout", {
      "authgear.session": sessionData,
    });
    const res = await handleLogout(req as any, CONFIG);

    expect(res.status).toBe(307);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("authgear.session=");
    expect(setCookie).toContain("Max-Age=0");
  });
});
