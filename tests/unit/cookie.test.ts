import { describe, it, expect } from "vitest";
import { encryptSession, decryptSession } from "../../src/session/cookie.js";
import type { SessionData } from "../../src/types.js";

const SECRET = "a-super-secret-key-that-is-at-least-32-chars";

const SESSION: SessionData = {
  accessToken: "access_token_value",
  refreshToken: "refresh_token_value",
  idToken: "id_token_value",
  expiresAt: 9999999999,
};

describe("Session cookie encryption", () => {
  it("encrypts and decrypts session data round-trip", () => {
    const encrypted = encryptSession(SESSION, SECRET);
    const decrypted = decryptSession(encrypted, SECRET);
    expect(decrypted).toEqual(SESSION);
  });

  it("returns null for tampered ciphertext", () => {
    const encrypted = encryptSession(SESSION, SECRET);
    const tampered = encrypted.slice(0, -4) + "XXXX";
    expect(decryptSession(tampered, SECRET)).toBeNull();
  });

  it("returns null for wrong secret", () => {
    const encrypted = encryptSession(SESSION, SECRET);
    expect(decryptSession(encrypted, "a-different-secret-key-that-is-32plus")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decryptSession("", SECRET)).toBeNull();
  });

  it("produces different ciphertext each call (random IV)", () => {
    const a = encryptSession(SESSION, SECRET);
    const b = encryptSession(SESSION, SECRET);
    expect(a).not.toBe(b);
  });

  it("preserves null fields", () => {
    const sessionWithNulls: SessionData = {
      ...SESSION,
      refreshToken: null,
      idToken: null,
    };
    const encrypted = encryptSession(sessionWithNulls, SECRET);
    const decrypted = decryptSession(encrypted, SECRET);
    expect(decrypted?.refreshToken).toBeNull();
    expect(decrypted?.idToken).toBeNull();
  });
});
