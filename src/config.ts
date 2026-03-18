import { type AuthgearConfig, DEFAULT_SCOPES } from "./types.js";

export function resolveConfig(config: AuthgearConfig): Required<AuthgearConfig> {
  if (!config.endpoint) throw new Error("AuthgearConfig: endpoint is required");
  if (!config.clientID) throw new Error("AuthgearConfig: clientID is required");
  if (!config.redirectURI) throw new Error("AuthgearConfig: redirectURI is required");
  if (!config.sessionSecret || config.sessionSecret.length < 32) {
    throw new Error("AuthgearConfig: sessionSecret must be at least 32 characters");
  }

  return {
    endpoint: config.endpoint.replace(/\/+$/, ""),
    clientID: config.clientID,
    redirectURI: config.redirectURI,
    postLogoutRedirectURI: config.postLogoutRedirectURI ?? "/",
    scopes: config.scopes ?? DEFAULT_SCOPES,
    sessionSecret: config.sessionSecret,
    cookieName: config.cookieName ?? "authgear.session",
  };
}
