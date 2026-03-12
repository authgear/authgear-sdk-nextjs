import { jwtVerify } from "jose";
import type { JWTPayload, OIDCConfiguration } from "../types.js";
import { getJWKS } from "./jwks.js";

export interface VerifyOptions {
  /** Expected audience. If not set, audience is not checked. */
  audience?: string | string[];
}

export async function verifyJWT(
  token: string,
  oidcConfig: OIDCConfiguration,
  options?: VerifyOptions,
): Promise<JWTPayload> {
  const jwks = getJWKS(oidcConfig);

  const { payload } = await jwtVerify(token, jwks, {
    issuer: oidcConfig.issuer,
    audience: options?.audience,
    algorithms: ["RS256"],
  });

  return payload as unknown as JWTPayload;
}
