"use server";

import { auth, getOpenURL, Page, SessionState } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";
import { headers } from "next/headers";

export async function getSettingsURLAction(): Promise<string> {
  return getOpenURL(Page.Settings, authgearConfig);
}

export async function callMeAction(): Promise<unknown> {
  const session = await auth(authgearConfig);
  if (session.state !== SessionState.Authenticated || !session.accessToken) {
    throw new Error("Not authenticated");
  }

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/me`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`/api/me returned ${res.status}: ${text}`);
  }

  return res.json();
}
