import { randomBytes } from "node:crypto";
import type { OIDCConfiguration } from "../types.js";
import { computeCodeChallenge } from "./pkce.js";

/**
 * Build the URL to open an Authgear page (e.g. /settings) with the user
 * already authenticated via an app session token.
 */
export function buildOpenURL(
  oidcConfig: OIDCConfiguration,
  params: {
    clientID: string;
    appSessionToken: string;
    targetPath: string; // e.g. "/settings"
    scopes: string[];
  },
): string {
  const authorizationEndpoint = new URL(oidcConfig.authorization_endpoint);
  const settingsURL = `${authorizationEndpoint.origin}${params.targetPath}`;
  const loginHint = `https://authgear.com/login_hint?type=app_session_token&app_session_token=${encodeURIComponent(params.appSessionToken)}`;

  const url = new URL(oidcConfig.authorization_endpoint);
  url.searchParams.set("response_type", "none");
  url.searchParams.set("client_id", params.clientID);
  url.searchParams.set("redirect_uri", settingsURL);
  url.searchParams.set("scope", params.scopes.join(" "));
  url.searchParams.set("prompt", "none");
  url.searchParams.set("login_hint", loginHint);
  return url.toString();
}

export interface AuthorizeParams {
  clientID: string;
  redirectURI: string;
  scopes: string[];
  codeVerifier: string;
  state: string;
  prompt?: string;
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
  if (params.prompt) {
    url.searchParams.set("prompt", params.prompt);
  }
  return url.toString();
}
