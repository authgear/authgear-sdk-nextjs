import { NextResponse, type NextRequest } from "next/server";
import { Page, type AuthgearConfig, type OIDCConfiguration } from "../types.js";
import { resolveConfig } from "../config.js";
import { fetchOIDCConfiguration } from "../oauth/discovery.js";
import { getAppSessionToken } from "../oauth/token.js";
import { buildOpenURL } from "../oauth/authorize.js";
import { decryptSession } from "../session/cookie.js";

const ALLOWED_PAGES = new Set<string>(Object.values(Page));

async function buildRedirectURL(
  oidcConfig: OIDCConfiguration,
  endpoint: string,
  refreshToken: string,
  clientID: string,
  scopes: string[],
  targetPath: string,
): Promise<string | NextResponse> {
  try {
    const tokenResponse = await getAppSessionToken(endpoint, refreshToken);
    return buildOpenURL(oidcConfig, {
      clientID,
      appSessionToken: tokenResponse.app_session_token,
      targetPath,
      scopes,
    });
  } catch {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }
}

function getRefreshToken(
  request: NextRequest,
  cookieName: string,
  sessionSecret: string,
): string | NextResponse {
  const sessionCookieValue = request.cookies.get(cookieName)?.value;
  if (sessionCookieValue === undefined || sessionCookieValue === "") {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const sessionData = decryptSession(sessionCookieValue, sessionSecret);
  if (sessionData === null) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (sessionData.refreshToken === null || sessionData.refreshToken === "") {
    return NextResponse.json({ error: "no_refresh_token" }, { status: 401 });
  }

  return sessionData.refreshToken;
}

export async function handleOpen(
  request: NextRequest,
  config: AuthgearConfig,
): Promise<NextResponse> {
  const resolved = resolveConfig(config);

  const pageParam = request.nextUrl.searchParams.get("page");
  if (pageParam === null || pageParam === "" || !ALLOWED_PAGES.has(pageParam)) {
    return NextResponse.json({ error: "invalid_page" }, { status: 400 });
  }

  const refreshTokenOrError = getRefreshToken(request, resolved.cookieName, resolved.sessionSecret);
  if (refreshTokenOrError instanceof NextResponse) {
    return refreshTokenOrError;
  }

  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
  const urlOrError = await buildRedirectURL(
    oidcConfig,
    resolved.endpoint,
    refreshTokenOrError,
    resolved.clientID,
    resolved.scopes,
    pageParam,
  );

  if (urlOrError instanceof NextResponse) {
    return urlOrError;
  }

  return NextResponse.redirect(urlOrError, 302);
}
