export interface AuthgearConfig {
  /** Authgear endpoint, e.g. "https://myapp.authgear.cloud" */
  endpoint: string;
  /** OAuth client ID */
  clientID: string;
  /** Redirect URI for OAuth callback, e.g. "http://localhost:3000/api/auth/callback" */
  redirectURI: string;
  /** Where to redirect after logout */
  postLogoutRedirectURI?: string;
  /** OAuth scopes. Defaults to ["openid", "offline_access", "https://authgear.com/scopes/full-userinfo"] */
  scopes?: string[];
  /** Secret key for encrypting session cookie (min 32 chars) */
  sessionSecret: string;
  /** Session cookie name. Defaults to "authgear.session" */
  cookieName?: string;
}

/**
 * Pages that can be opened via `getOpenURL` from `@authgear/nextjs/server`.
 */
export enum Page {
  Settings = "/settings",
}

export const DEFAULT_SCOPES = [
  "openid",
  "offline_access",
  "https://authgear.com/scopes/full-userinfo",
];

export enum SessionState {
  Unknown = "UNKNOWN",
  NoSession = "NO_SESSION",
  Authenticated = "AUTHENTICATED",
}

export interface SessionData {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number;
}

export interface Session {
  state: SessionState;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
  user: UserInfo | null;
}

export interface UserInfo {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  preferredUsername?: string;
  givenName?: string;
  familyName?: string;
  name?: string;
  picture?: string;
  roles?: string[];
  isAnonymous?: boolean;
  isVerified?: boolean;
  canReauthenticate?: boolean;
  customAttributes?: Record<string, unknown>;
  raw: Record<string, unknown>;
}

export interface JWTPayload {
  sub: string;
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  jti?: string;
  client_id?: string;
  "https://authgear.com/claims/user/is_anonymous"?: boolean;
  "https://authgear.com/claims/user/is_verified"?: boolean;
  "https://authgear.com/claims/user/can_reauthenticate"?: boolean;
  "https://authgear.com/claims/user/roles"?: string[];
  [key: string]: unknown;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

export interface AppSessionTokenResponse {
  app_session_token: string;
  expire_at: string;
}

export interface OIDCConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  issuer: string;
}
