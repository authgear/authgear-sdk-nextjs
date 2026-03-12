import { describe, it, expect } from "vitest";
import { generateCodeVerifier, computeCodeChallenge } from "../../src/oauth/pkce.js";
import { createHash } from "node:crypto";

describe("PKCE", () => {
  describe("generateCodeVerifier", () => {
    it("generates a 64-character string", () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toHaveLength(64);
    });

    it("generates only base64url-safe characters", () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
    });

    it("generates unique values each call", () => {
      const a = generateCodeVerifier();
      const b = generateCodeVerifier();
      expect(a).not.toEqual(b);
    });
  });

  describe("computeCodeChallenge", () => {
    it("returns base64url-encoded SHA256 of the verifier", () => {
      const verifier = "test-verifier-abc123";
      const challenge = computeCodeChallenge(verifier);
      const expected = createHash("sha256").update(verifier).digest("base64url");
      expect(challenge).toBe(expected);
    });

    it("returns only base64url-safe characters", () => {
      const verifier = generateCodeVerifier();
      const challenge = computeCodeChallenge(verifier);
      expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    });

    it("is deterministic", () => {
      const verifier = generateCodeVerifier();
      expect(computeCodeChallenge(verifier)).toBe(computeCodeChallenge(verifier));
    });
  });
});
