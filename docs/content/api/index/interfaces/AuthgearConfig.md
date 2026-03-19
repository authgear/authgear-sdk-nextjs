[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [index](../README.md) / AuthgearConfig

# Interface: AuthgearConfig

Defined in: [src/types.ts:1](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L1)

## Extended by

- [`AuthgearProxyOptions`](../../proxy/interfaces/AuthgearProxyOptions.md)

## Properties

### clientID

> **clientID**: `string`

Defined in: [src/types.ts:5](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L5)

OAuth client ID

***

### cookieName?

> `optional` **cookieName**: `string`

Defined in: [src/types.ts:15](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L15)

Session cookie name. Defaults to "authgear.session"

***

### endpoint

> **endpoint**: `string`

Defined in: [src/types.ts:3](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L3)

Authgear endpoint, e.g. "https://myapp.authgear.cloud"

***

### isSSOEnabled?

> `optional` **isSSOEnabled**: `boolean`

Defined in: [src/types.ts:24](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L24)

Whether to enable SSO (Single Sign-On) with other apps on the same Authgear tenant.
When `true` (default), Authgear silently reuses its server-side session if the user
is already logged in, so users are not prompted for credentials again.
Set to `false` to always show the login form (`prompt=login`), which is recommended
for single-app deployments where silent sign-in feels unexpected to the user.
Defaults to `true`.

***

### postLogoutRedirectURI?

> `optional` **postLogoutRedirectURI**: `string`

Defined in: [src/types.ts:9](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L9)

Where to redirect after logout

***

### redirectURI

> **redirectURI**: `string`

Defined in: [src/types.ts:7](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L7)

Redirect URI for OAuth callback, e.g. "http://localhost:3000/api/auth/callback"

***

### scopes?

> `optional` **scopes**: `string`[]

Defined in: [src/types.ts:11](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L11)

OAuth scopes. Defaults to ["openid", "offline_access", "https://authgear.com/scopes/full-userinfo"]

***

### sessionSecret

> **sessionSecret**: `string`

Defined in: [src/types.ts:13](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/types.ts#L13)

Secret key for encrypting session cookie (min 32 chars)
