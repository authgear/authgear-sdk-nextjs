---
sidebar_position: 10
---

# Roadmap

## `open(page)` — Open Authgear Settings Page

> **Status: pending server-side enablement**

A planned `getOpenURL(page, config)` function modelled after [`authgear.open(Page.Settings)`](https://docs.authgear.com/get-started/single-page-app/website#step-8-open-user-settings-page) in the Authgear Web SDK.

It will open the Authgear-hosted settings UI (change password, manage MFA, etc.) with the current user already authenticated — no re-login required.

### Planned API

```ts title="app/dashboard/actions.ts (Server Action)"
"use server";
import { getOpenURL, Page } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";

export async function getSettingsURLAction() {
  return getOpenURL(Page.Settings, authgearConfig);
}
```

```tsx title="app/dashboard/SettingsButton.tsx"
"use client";
import { getSettingsURLAction } from "./actions";

export function SettingsButton() {
  return (
    <button onClick={async () => {
      const url = await getSettingsURLAction();
      window.open(url, "_blank");
    }}>
      Account Settings
    </button>
  );
}
```

### Blocker

This feature exchanges the refresh token for an `app_session_token` via `POST /oauth2/app_session_token`. The Authgear server must grant the OAuth client **"full user access"** permission before this endpoint is accessible. The implementation is already written in `src/server.ts` (commented out) and will be uncommented once that server-side configuration is available.
