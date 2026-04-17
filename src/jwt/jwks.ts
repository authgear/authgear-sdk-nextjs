import { createRemoteJWKSet } from "jose";
import type { OIDCConfiguration } from "../types.js";

const jwksSets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export function getJWKS(
  oidcConfig: OIDCConfiguration
): ReturnType<typeof createRemoteJWKSet> {
  const uri = oidcConfig.jwks_uri;
  let jwks = jwksSets.get(uri);
  if (jwks === undefined) {
    jwks = createRemoteJWKSet(new URL(uri));
    jwksSets.set(uri, jwks);
  }
  return jwks;
}

/** Clear cached JWKS (useful for testing) */
export function clearJWKSCache(): void {
  jwksSets.clear();
}
