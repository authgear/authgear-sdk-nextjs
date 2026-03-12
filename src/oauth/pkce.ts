import { randomBytes, createHash } from "node:crypto";

const VERIFIER_LENGTH = 64;

export function generateCodeVerifier(): string {
  return randomBytes(VERIFIER_LENGTH)
    .toString("base64url")
    .slice(0, VERIFIER_LENGTH);
}

export function computeCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}
