import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT, exportJWK, generateKeyPair, type KeyLike } from "jose";
import { verifyJWT } from "../../src/jwt/verify.js";
import { clearJWKSCache } from "../../src/jwt/jwks.js";
import type { OIDCConfiguration } from "../../src/types.js";

// We test verifyJWT with mocked JWKS via a local key pair
// NOTE: createRemoteJWKSet is mocked to use our local key

let privateKey: KeyLike;
let publicKey: KeyLike;

const ISSUER = "https://test.authgear.cloud";
const JWKS_URI = "https://test.authgear.cloud/oauth2/jwks";

const mockOIDCConfig: OIDCConfiguration = {
  authorization_endpoint: `${ISSUER}/oauth2/authorize`,
  token_endpoint: `${ISSUER}/oauth2/token`,
  userinfo_endpoint: `${ISSUER}/oauth2/userinfo`,
  revocation_endpoint: `${ISSUER}/oauth2/revoke`,
  end_session_endpoint: `${ISSUER}/oauth2/logout`,
  jwks_uri: JWKS_URI,
  issuer: ISSUER,
};

beforeEach(async () => {
  const keys = await generateKeyPair("RS256");
  privateKey = keys.privateKey;
  publicKey = keys.publicKey;
  clearJWKSCache();
});

async function signToken(payload: Record<string, unknown>, options?: { expiresIn?: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setIssuedAt()
    .setExpirationTime(options?.expiresIn ?? "1h")
    .sign(privateKey);
}

describe("verifyJWT", () => {
  it("verifies a valid token and returns payload", async () => {
    // Mock the JWKS endpoint to return our public key
    const jwk = await exportJWK(publicKey);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === JWKS_URI) {
          return new Response(JSON.stringify({ keys: [{ ...jwk, kid: "test-kid", use: "sig" }] }));
        }
        return new Response("not found", { status: 404 });
      }),
    );

    const token = await signToken({ sub: "user-123" });
    clearJWKSCache();

    const payload = await verifyJWT(token, mockOIDCConfig);
    expect(payload.sub).toBe("user-123");
    expect(payload.iss).toBe(ISSUER);
  });

  it("throws for expired token", async () => {
    const jwk = await exportJWK(publicKey);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ keys: [{ ...jwk, kid: "key1", use: "sig" }] }))
      ),
    );

    const expiredToken = await new SignJWT({ sub: "user-123" })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer(ISSUER)
      .setAudience(ISSUER)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1800)
      .sign(privateKey);

    clearJWKSCache();
    await expect(verifyJWT(expiredToken, mockOIDCConfig)).rejects.toThrow();
  });

  it("throws for wrong issuer", async () => {
    const { privateKey: otherKey, publicKey: otherPublic } = await generateKeyPair("RS256");
    const jwk = await exportJWK(otherPublic);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ keys: [{ ...jwk, kid: "key1", use: "sig" }] }))
      ),
    );

    const wrongIssuerToken = await new SignJWT({ sub: "user-123" })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer("https://evil.example.com")
      .setAudience(ISSUER)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(otherKey);

    clearJWKSCache();
    await expect(verifyJWT(wrongIssuerToken, mockOIDCConfig)).rejects.toThrow();
  });
});
