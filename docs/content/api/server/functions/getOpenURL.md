[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [server](../README.md) / getOpenURL

# Function: getOpenURL()

> **getOpenURL**(`page`, `config`): `Promise`\<`string`\>

Defined in: [src/server.ts:164](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/server.ts#L164)

Get a URL that opens an Authgear page (e.g. `/settings`) with the current
user already authenticated — no re-login required.

Exchanges the user's refresh token for a short-lived `app_session_token`
via `POST /oauth2/app_session_token`, then builds an authorization URL
that uses that token as a `login_hint` so Authgear can authenticate the
user silently.

## Parameters

### page

`string`

A `Page` enum value (e.g. `Page.Settings`) or an arbitrary path string.

### config

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

The Authgear SDK config.

## Returns

`Promise`\<`string`\>

A URL string. Open it in a new tab (`window.open(url, "_blank")`).

## Throws

If the user is not authenticated or has no refresh token.

## Example

```ts
// Server Action
"use server";
import { getOpenURL, Page } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";

export async function getSettingsURLAction() {
  return getOpenURL(Page.Settings, authgearConfig);
}
```
