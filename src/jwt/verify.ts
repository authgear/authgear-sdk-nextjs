import { jwtVerify } from "jose";
import type { JWTPayload, OIDCConfiguration } from "../types.js";
import { getJWKS } from "./jwks.js";

export interface VerifyOptions {
  /** Expected audience. If not set, audience is not checked. */
  audience?: string | string[];
}

function parseJWTPayload(raw: Record<string, unknown>): JWTPayload {
  /* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
  return {
    sub: raw["sub"] as string,
    iss: raw["iss"] as string,
    aud: raw["aud"] as string | string[],
    exp: raw["exp"] as number,
    iat: raw["iat"] as number,
    ...raw,
  };
  /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
}

export async function verifyJWT(
  token: string,
  oidcConfig: OIDCConfiguration,
  options?: VerifyOptions
): Promise<JWTPayload> {
  const jwks = getJWKS(oidcConfig);

  const { payload } = await jwtVerify(token, jwks, {
    issuer: oidcConfig.issuer,
    audience: options?.audience,
    algorithms: ["RS256"],
  });

  return parseJWTPayload(payload as Record<string, unknown>);
}
