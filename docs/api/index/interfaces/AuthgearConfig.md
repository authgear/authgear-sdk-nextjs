# Interface: AuthgearConfig

Defined in: src/types.ts:1

## Extended by

- [`AuthgearProxyOptions`](../../proxy/interfaces/AuthgearProxyOptions.md)

## Properties

### clientID

> **clientID**: `string`

Defined in: src/types.ts:5

OAuth client ID

***

### clientSecret?

> `optional` **clientSecret**: `string`

Defined in: src/types.ts:7

OAuth client secret (for confidential server-side clients)

***

### cookieName?

> `optional` **cookieName**: `string`

Defined in: src/types.ts:17

Session cookie name. Defaults to "authgear.session"

***

### endpoint

> **endpoint**: `string`

Defined in: src/types.ts:3

Authgear endpoint, e.g. "https://myapp.authgear.cloud"

***

### postLogoutRedirectURI?

> `optional` **postLogoutRedirectURI**: `string`

Defined in: src/types.ts:11

Where to redirect after logout

***

### redirectURI

> **redirectURI**: `string`

Defined in: src/types.ts:9

Redirect URI for OAuth callback, e.g. "http://localhost:3000/api/auth/callback"

***

### scopes?

> `optional` **scopes**: `string`[]

Defined in: src/types.ts:13

OAuth scopes. Defaults to ["openid", "offline_access", "https://authgear.com/scopes/full-userinfo"]

***

### sessionSecret

> **sessionSecret**: `string`

Defined in: src/types.ts:15

Secret key for encrypting session cookie (min 32 chars)
