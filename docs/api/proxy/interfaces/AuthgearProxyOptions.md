# Interface: AuthgearProxyOptions

Defined in: src/proxy.ts:9

## Extends

- [`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

## Properties

### clientID

> **clientID**: `string`

Defined in: src/types.ts:5

OAuth client ID

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`clientID`](../../index/interfaces/AuthgearConfig.md#clientid)

***

### clientSecret?

> `optional` **clientSecret**: `string`

Defined in: src/types.ts:7

OAuth client secret (for confidential server-side clients)

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`clientSecret`](../../index/interfaces/AuthgearConfig.md#clientsecret)

***

### cookieName?

> `optional` **cookieName**: `string`

Defined in: src/types.ts:17

Session cookie name. Defaults to "authgear.session"

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`cookieName`](../../index/interfaces/AuthgearConfig.md#cookiename)

***

### endpoint

> **endpoint**: `string`

Defined in: src/types.ts:3

Authgear endpoint, e.g. "https://myapp.authgear.cloud"

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`endpoint`](../../index/interfaces/AuthgearConfig.md#endpoint)

***

### loginPath?

> `optional` **loginPath**: `string`

Defined in: src/proxy.ts:26

URL to redirect unauthenticated users. Defaults to "/api/auth/login".

***

### postLogoutRedirectURI?

> `optional` **postLogoutRedirectURI**: `string`

Defined in: src/types.ts:11

Where to redirect after logout

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`postLogoutRedirectURI`](../../index/interfaces/AuthgearConfig.md#postlogoutredirecturi)

***

### protectedPaths?

> `optional` **protectedPaths**: `string`[]

Defined in: src/proxy.ts:14

Paths that require authentication. Unauthenticated requests are redirected to login.
Supports exact paths and prefix patterns ending with `*` (e.g. "/dashboard/*").

***

### publicPaths?

> `optional` **publicPaths**: `string`[]

Defined in: src/proxy.ts:21

Paths that are always public (never redirected to login).
Takes precedence over protectedPaths.
Defaults to ["/api/auth/*"].

***

### redirectURI

> **redirectURI**: `string`

Defined in: src/types.ts:9

Redirect URI for OAuth callback, e.g. "http://localhost:3000/api/auth/callback"

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`redirectURI`](../../index/interfaces/AuthgearConfig.md#redirecturi)

***

### scopes?

> `optional` **scopes**: `string`[]

Defined in: src/types.ts:13

OAuth scopes. Defaults to ["openid", "offline_access", "https://authgear.com/scopes/full-userinfo"]

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`scopes`](../../index/interfaces/AuthgearConfig.md#scopes)

***

### sessionSecret

> **sessionSecret**: `string`

Defined in: src/types.ts:15

Secret key for encrypting session cookie (min 32 chars)

#### Inherited from

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md).[`sessionSecret`](../../index/interfaces/AuthgearConfig.md#sessionsecret)
