import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import type { SessionData } from "../types.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SALT = "authgear-nextjs-session";

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, SALT, KEY_LENGTH);
}

export function encryptSession(data: SessionData, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: base64(iv + authTag + encrypted)
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

export function decryptSession(encrypted: string, secret: string): SessionData | null {
  try {
    const key = deriveKey(secret);
    const buf = Buffer.from(encrypted, "base64url");

    if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) return null;

    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (JSON.parse(decrypted.toString("utf8")) as unknown) as SessionData;
  } catch {
    return null;
  }
}

export interface CookieOptions {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
}

export function buildSessionCookie(
  cookieName: string,
  data: SessionData,
  secret: string,
): CookieOptions {
  return {
    name: cookieName,
    value: encryptSession(data, secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };
}

export function buildClearCookie(cookieName: string): CookieOptions {
  return {
    name: cookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}

export function buildPKCECookie(
  data: { codeVerifier: string; state: string; returnTo: string },
  secret: string,
): CookieOptions {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    name: "authgear.pkce",
    value: Buffer.concat([iv, authTag, encrypted]).toString("base64url"),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  };
}

export function decryptPKCECookie(
  encrypted: string,
  secret: string,
): { codeVerifier: string; state: string; returnTo: string } | null {
  try {
    const key = deriveKey(secret);
    const buf = Buffer.from(encrypted, "base64url");

    if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) return null;

    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (JSON.parse(decrypted.toString("utf8")) as unknown) as { codeVerifier: string; state: string; returnTo: string };
  } catch {
    return null;
  }
}
