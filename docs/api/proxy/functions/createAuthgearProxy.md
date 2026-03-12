# Function: createAuthgearProxy()

> **createAuthgearProxy**(`options`): (`request`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: src/proxy.ts:47

Create a Next.js 16 proxy function for Authgear authentication.

Usage in `proxy.ts`:
```ts
import { createAuthgearProxy } from "@authgear/nextjs/proxy";
export const proxy = createAuthgearProxy({ ...config, protectedPaths: ["/dashboard/*"] });
```

## Parameters

### options

[`AuthgearProxyOptions`](../interfaces/AuthgearProxyOptions.md)

## Returns

> (`request`): `Promise`\<`NextResponse`\<`unknown`\>\>

### Parameters

#### request

`NextRequest`

### Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
