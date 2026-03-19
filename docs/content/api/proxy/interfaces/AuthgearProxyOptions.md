[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [proxy](../README.md) / AuthgearProxyOptions

# Interface: AuthgearProxyOptions

Defined in: [src/proxy.ts:9](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/proxy.ts#L9)

## Extends

- [`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

## Properties

### clientID

> **clientID**: `string`

Defined in: [src/types.ts:5](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L5)

OAuth client ID

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`clientID`](../../index/interfaces/AuthgearConfig.md#clientid)

***

### cookieName?

> `optional` **cookieName**: `string`

Defined in: [src/types.ts:15](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L15)

Session cookie name. Defaults to "authgear.session"

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`cookieName`](../../index/interfaces/AuthgearConfig.md#cookiename)

***

### endpoint

> **endpoint**: `string`

Defined in: [src/types.ts:3](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L3)

Authgear endpoint, e.g. "https://myapp.authgear.cloud"

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`endpoint`](../../index/interfaces/AuthgearConfig.md#endpoint)

***

### isSSOEnabled?

> `optional` **isSSOEnabled**: `boolean`

Defined in: [src/types.ts:24](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L24)

Whether to enable SSO (Single Sign-On) with other apps on the same Authgear tenant.
When `true` (default), Authgear silently reuses its server-side session if the user
is already logged in, so users are not prompted for credentials again.
Set to `false` to always show the login form (`prompt=login`), which is recommended
for single-app deployments where silent sign-in feels unexpected to the user.
Defaults to `true`.

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`isSSOEnabled`](../../index/interfaces/AuthgearConfig.md#isssoenabled)

***

### loginPath?

> `optional` **loginPath**: `string`

Defined in: [src/proxy.ts:26](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/proxy.ts#L26)

URL to redirect unauthenticated users. Defaults to "/api/auth/login".

***

### postLogoutRedirectURI?

> `optional` **postLogoutRedirectURI**: `string`

Defined in: [src/types.ts:9](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L9)

Where to redirect after logout

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`postLogoutRedirectURI`](../../index/interfaces/AuthgearConfig.md#postlogoutredirecturi)

***

### protectedPaths?

> `optional` **protectedPaths**: `string`[]

Defined in: [src/proxy.ts:14](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/proxy.ts#L14)

Paths that require authentication. Unauthenticated requests are redirected to login.
Supports exact paths and prefix patterns ending with `*` (e.g. "/dashboard/*").

***

### publicPaths?

> `optional` **publicPaths**: `string`[]

Defined in: [src/proxy.ts:21](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/proxy.ts#L21)

Paths that are always public (never redirected to login).
Takes precedence over protectedPaths.
Defaults to ["/api/auth/*"].

***

### redirectURI

> **redirectURI**: `string`

Defined in: [src/types.ts:7](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L7)

Redirect URI for OAuth callback, e.g. "http://localhost:3000/api/auth/callback"

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`redirectURI`](../../index/interfaces/AuthgearConfig.md#redirecturi)

***

### scopes?

> `optional` **scopes**: `string`[]

Defined in: [src/types.ts:11](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L11)

OAuth scopes. Defaults to ["openid", "offline_access", "https://authgear.com/scopes/full-userinfo"]

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`scopes`](../../index/interfaces/AuthgearConfig.md#scopes)

***

### sessionSecret

> **sessionSecret**: `string`

Defined in: [src/types.ts:13](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L13)

Secret key for encrypting session cookie (min 32 chars)

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`sessionSecret`](../../index/interfaces/AuthgearConfig.md#sessionsecret)
