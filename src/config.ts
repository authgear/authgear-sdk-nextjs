import { type AuthgearConfig, DEFAULT_SCOPES } from "./types.js";

function validateRequiredString(value: string, fieldName: string): void {
  if (value === "") throw new Error(`AuthgearConfig: ${fieldName} is required`);
}

export function resolveConfig(config: AuthgearConfig): Required<AuthgearConfig> {
  validateRequiredString(config.endpoint, "endpoint");
  validateRequiredString(config.clientID, "clientID");
  validateRequiredString(config.redirectURI, "redirectURI");

  if (config.sessionSecret === "" || config.sessionSecret.length < 32) {
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
    isSSOEnabled: config.isSSOEnabled ?? true,
  };
}
