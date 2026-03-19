import { describe, it, expect } from "vitest";
import { buildAuthorizeURL, generateState, buildOpenURL } from "../../src/oauth/authorize.js";
import type { OIDCConfiguration } from "../../src/types.js";

const mockOIDCConfig: OIDCConfiguration = {
  authorization_endpoint: "https://myapp.authgear.cloud/oauth2/authorize",
  token_endpoint: "https://myapp.authgear.cloud/oauth2/token",
  userinfo_endpoint: "https://myapp.authgear.cloud/oauth2/userinfo",
  revocation_endpoint: "https://myapp.authgear.cloud/oauth2/revoke",
  end_session_endpoint: "https://myapp.authgear.cloud/oauth2/logout",
  jwks_uri: "https://myapp.authgear.cloud/oauth2/jwks",
  issuer: "https://myapp.authgear.cloud",
};

describe("buildAuthorizeURL", () => {
  it("includes all required OAuth parameters", () => {
    const url = new URL(buildAuthorizeURL(mockOIDCConfig, {
      clientID: "test-client-id",
      redirectURI: "http://localhost:3000/api/auth/callback",
      scopes: ["openid", "offline_access"],
      codeVerifier: "my-verifier",
      state: "random-state",
    }));

    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("test-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:3000/api/auth/callback");
    expect(url.searchParams.get("scope")).toBe("openid offline_access");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("state")).toBe("random-state");
    expect(url.searchParams.get("code_challenge")).toBeTruthy();
  });

  it("uses the authorization endpoint from OIDC config", () => {
    const url = buildAuthorizeURL(mockOIDCConfig, {
      clientID: "id",
      redirectURI: "http://localhost/callback",
      scopes: ["openid"],
      codeVerifier: "verifier",
      state: "state",
    });
    expect(url.startsWith("https://myapp.authgear.cloud/oauth2/authorize")).toBe(true);
  });

  it("encodes all scopes space-separated", () => {
    const url = new URL(buildAuthorizeURL(mockOIDCConfig, {
      clientID: "id",
      redirectURI: "http://localhost/callback",
      scopes: ["openid", "offline_access", "https://authgear.com/scopes/full-userinfo"],
      codeVerifier: "verifier",
      state: "state",
    }));
    expect(url.searchParams.get("scope")).toBe(
      "openid offline_access https://authgear.com/scopes/full-userinfo"
    );
  });
});

describe("generateState", () => {
  it("generates a non-empty string", () => {
    expect(generateState().length).toBeGreaterThan(0);
  });

  it("generates unique values", () => {
    expect(generateState()).not.toBe(generateState());
  });

  it("generates base64url-safe characters", () => {
    expect(generateState()).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});

const openURLBaseParams = {
  clientID: "test-client",
  appSessionToken: "tok_abc123",
  targetPath: "/settings",
  scopes: ["openid", "offline_access"],
};

describe("buildOpenURL", () => {
  it("sets response_type to none", () => {
    const url = new URL(buildOpenURL(mockOIDCConfig, openURLBaseParams));
    expect(url.searchParams.get("response_type")).toBe("none");
  });

  it("sets prompt to none", () => {
    const url = new URL(buildOpenURL(mockOIDCConfig, openURLBaseParams));
    expect(url.searchParams.get("prompt")).toBe("none");
  });

  it("builds redirect_uri from authorization_endpoint origin + targetPath", () => {
    const url = new URL(buildOpenURL(mockOIDCConfig, openURLBaseParams));
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://myapp.authgear.cloud/settings"
    );
  });

  it("encodes the app_session_token in login_hint", () => {
    const tokenWithSpecialChars = "tok+a=b/c";
    const url = new URL(buildOpenURL(mockOIDCConfig, {
      ...openURLBaseParams,
      appSessionToken: tokenWithSpecialChars,
    }));
    const loginHint = url.searchParams.get("login_hint") ?? "";
    expect(loginHint).toContain("type=app_session_token");
    expect(loginHint).toContain(`app_session_token=${encodeURIComponent(tokenWithSpecialChars)}`);
  });

  it("sets client_id", () => {
    const url = new URL(buildOpenURL(mockOIDCConfig, {
      ...openURLBaseParams,
      clientID: "my-app",
    }));
    expect(url.searchParams.get("client_id")).toBe("my-app");
  });

  it("includes scope as space-separated string", () => {
    const url = new URL(buildOpenURL(mockOIDCConfig, {
      ...openURLBaseParams,
      scopes: ["openid", "offline_access", "https://authgear.com/scopes/full-userinfo"],
    }));
    expect(url.searchParams.get("scope")).toBe(
      "openid offline_access https://authgear.com/scopes/full-userinfo"
    );
  });
});
