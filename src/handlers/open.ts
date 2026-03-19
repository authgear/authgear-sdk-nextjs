import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig } from "../types.js";
import { Page } from "../types.js";
import { resolveConfig } from "../config.js";
import { fetchOIDCConfiguration } from "../oauth/discovery.js";
import { getAppSessionToken } from "../oauth/token.js";
import { buildOpenURL } from "../oauth/authorize.js";
import { decryptSession } from "../session/cookie.js";

const ALLOWED_PAGES = new Set<string>(Object.values(Page));

export async function handleOpen(
  request: NextRequest,
  config: AuthgearConfig,
): Promise<NextResponse> {
  const resolved = resolveConfig(config);

  const pageParam = request.nextUrl.searchParams.get("page");
  if (!pageParam || !ALLOWED_PAGES.has(pageParam)) {
    return NextResponse.json({ error: "invalid_page" }, { status: 400 });
  }

  const sessionCookieValue = request.cookies.get(resolved.cookieName)?.value;
  if (!sessionCookieValue) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const sessionData = decryptSession(sessionCookieValue, resolved.sessionSecret);
  if (!sessionData) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (!sessionData.refreshToken) {
    return NextResponse.json({ error: "no_refresh_token" }, { status: 401 });
  }

  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
  const { app_session_token } = await getAppSessionToken(
    resolved.endpoint,
    sessionData.refreshToken,
  );

  const url = buildOpenURL(oidcConfig, {
    clientID: resolved.clientID,
    appSessionToken: app_session_token,
    targetPath: pageParam,
    scopes: resolved.scopes,
  });

  return NextResponse.redirect(url, 302);
}
