[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [proxy](../README.md) / createAuthgearProxy

# Function: createAuthgearProxy()

> **createAuthgearProxy**(`options`): (`request`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/proxy.ts:124](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/proxy.ts#L124)

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
