# Function: createAuthgearHandlers()

> **createAuthgearHandlers**(`config`): `object`

Defined in: src/handlers/index.ts:25

Creates Next.js route handlers for all Authgear auth endpoints.

Usage in `app/api/auth/[...authgear]/route.ts`:
```ts
import { createAuthgearHandlers } from "@authgear/nextjs";
export const { GET, POST } = createAuthgearHandlers(config);
```

Routes handled:
- GET /api/auth/login     — Start OAuth flow
- GET /api/auth/callback  — Handle OAuth callback
- GET /api/auth/logout    — Logout and revoke tokens
- POST /api/auth/refresh  — Refresh access token
- GET /api/auth/userinfo  — Get current user info

## Parameters

### config

[`AuthgearConfig`](../interfaces/AuthgearConfig.md)

## Returns

`object`

### GET()

> **GET**: (`request`, `__namedParameters`) => `Promise`\<`NextResponse`\<`unknown`\>\>

#### Parameters

##### request

`NextRequest`

##### \_\_namedParameters

###### params

`Promise`\<\{ `authgear`: `string`[]; \}\>

#### Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

### POST()

> **POST**: (`request`, `__namedParameters`) => `Promise`\<`NextResponse`\<`unknown`\>\>

#### Parameters

##### request

`NextRequest`

##### \_\_namedParameters

###### params

`Promise`\<\{ `authgear`: `string`[]; \}\>

#### Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
