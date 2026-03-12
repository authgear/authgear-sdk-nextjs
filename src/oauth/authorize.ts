import { randomBytes } from "node:crypto";
import type { OIDCConfiguration } from "../types.js";
import { computeCodeChallenge } from "./pkce.js";

export interface AuthorizeParams {
  clientID: string;
  redirectURI: string;
  scopes: string[];
  codeVerifier: string;
  state: string;
}

export function generateState(): string {
  return randomBytes(32).toString("base64url");
}

export function buildAuthorizeURL(
  oidcConfig: OIDCConfiguration,
  params: AuthorizeParams,
): string {
  const url = new URL(oidcConfig.authorization_endpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientID);
  url.searchParams.set("redirect_uri", params.redirectURI);
  url.searchParams.set("scope", params.scopes.join(" "));
  url.searchParams.set("code_challenge", computeCodeChallenge(params.codeVerifier));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", params.state);
  return url.toString();
}
