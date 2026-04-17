import type {
  OIDCConfiguration,
  TokenResponse,
  AppSessionTokenResponse,
} from "../types.js";

export interface ExchangeCodeParams {
  code: string;
  codeVerifier: string;
  clientID: string;
  redirectURI: string;
}

export interface RefreshTokenParams {
  refreshToken: string;
  clientID: string;
}

export async function exchangeCode(
  oidcConfig: OIDCConfiguration,
  params: ExchangeCodeParams
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    code_verifier: params.codeVerifier,
    client_id: params.clientID,
    redirect_uri: params.redirectURI,
  });

  const res = await fetch(oidcConfig.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${error}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return (await res.json()) as unknown as TokenResponse;
}

export async function refreshAccessToken(
  oidcConfig: OIDCConfiguration,
  params: RefreshTokenParams
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
    client_id: params.clientID,
  });

  const res = await fetch(oidcConfig.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${error}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return (await res.json()) as unknown as TokenResponse;
}

export async function getAppSessionToken(
  endpoint: string,
  refreshToken: string
): Promise<AppSessionTokenResponse> {
  const res = await fetch(`${endpoint}/oauth2/app_session_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(
      `Failed to get app session token (${res.status}): ${error}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const json = (await res.json()) as unknown as {
    result: AppSessionTokenResponse;
  };
  return json.result;
}

export async function revokeToken(
  oidcConfig: OIDCConfiguration,
  token: string
): Promise<void> {
  await fetch(oidcConfig.revocation_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }).toString(),
  });
}
