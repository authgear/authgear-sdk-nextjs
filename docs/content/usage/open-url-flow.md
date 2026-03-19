# How `getOpenURL` Works — End-to-End Flow

`getOpenURL(page, config)` opens an Authgear-hosted page (e.g. `/settings`) with the current user already authenticated — no re-login required.

---

## Step 1 — User clicks the button (browser)

`SettingsButton` is a React client component. Clicking it calls the Next.js Server Action `getSettingsURLAction()`.

```tsx
// example/app/dashboard/SettingsButton.tsx
async function handleClick() {
  const url = await getSettingsURLAction();
  window.open(url, "_blank", "noopener,noreferrer");
}
```

---

## Step 2 — Server Action invokes `getOpenURL` (Next.js server)

The Server Action is marked `"use server"` — Next.js serializes the call over an internal POST to the server. The browser never touches the session tokens.

```ts
// example/app/dashboard/actions.ts
export async function getSettingsURLAction(): Promise<string> {
  return getOpenURL(Page.Settings, authgearConfig);
}
```

---

## Step 3 — Read and decrypt the session cookie (Next.js server)

`getOpenURL` reads the `authgear.session` cookie via `next/headers` and decrypts it with AES-256-GCM using the `SESSION_SECRET`. The decrypted payload is:

```json
{
  "accessToken": "...",
  "refreshToken": "rft_...",
  "idToken": "...",
  "expiresAt": 1234567890
}
```

Throws `"Not authenticated"` if no cookie or decryption fails, `"No refresh token in session"` if `refreshToken` is null.

---

## Step 4 — Exchange for an `app_session_token` (Next.js server → Authgear)

```
POST /oauth2/app_session_token
Content-Type: application/json

{ "refresh_token": "rft_..." }
```

Authgear validates the `refresh_token` to identify and authenticate the user session.

Response:

```json
{
  "result": {
    "app_session_token": "ast_...",
    "expire_at": "2026-03-18T22:00:00Z"
  }
}
```

The SDK unwraps the `result` field to extract the token.

---

## Step 5 — Build the pre-authenticated URL (Next.js server)

```
https://<endpoint>/oauth2/authorize
  ?response_type=none
  &client_id=<clientID>
  &redirect_uri=https://<endpoint>/settings
  &prompt=none
  &login_hint=https://authgear.com/login_hint?type=app_session_token&app_session_token=ast_...
```

| Parameter | Value | Purpose |
|---|---|---|
| `response_type` | `none` | No code or token returned to the app |
| `prompt` | `none` | Silent auth — no login UI shown |
| `redirect_uri` | `https://<endpoint>/settings` | Where Authgear redirects after auth |
| `login_hint` | URL-encoded token hint | Carries the `app_session_token` |

---

## Step 6 — URL returned to the browser

The Server Action returns the URL string to `SettingsButton`, which opens it in a new tab:

```ts
window.open(url, "_blank", "noopener,noreferrer");
```

---

## Step 7 — Authgear authenticates silently and redirects (browser → Authgear)

The new tab hits `/oauth2/authorize`. Authgear:

1. Reads `login_hint` → extracts and validates the `app_session_token`
2. Identifies the user → creates an Authgear web session
3. `response_type=none` → no token returned to the app
4. `prompt=none` → no login UI shown
5. Redirects to `redirect_uri` → `/settings`

The user lands on the Authgear settings page **already logged in**.

---

## Sequence Diagram

```
Browser          Next.js Server        Authgear
  |                    |                   |
  |-- click button --> |                   |
  |                    |-- decrypt cookie  |
  |                    |-- POST /oauth2/app_session_token -->
  |                    |   body: { refresh_token }
  |                    |<-- { result: { app_session_token } }
  |                    |-- build authorize URL             |
  |<-- return URL ---- |                   |
  |-- open new tab --------------------------->
  |   GET /oauth2/authorize?response_type=none&login_hint=...
  |                    |<-- redirect to /settings ---------
  |<-- /settings (authenticated) -------------|
```
