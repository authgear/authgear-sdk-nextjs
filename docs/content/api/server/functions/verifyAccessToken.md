[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [server](../README.md) / verifyAccessToken

# Function: verifyAccessToken()

> **verifyAccessToken**(`token`, `config`): `Promise`\<[`JWTPayload`](../../index/interfaces/JWTPayload.md)\>

Defined in: [src/server.ts:163](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/server.ts#L163)

Verify a JWT access token (from Authorization: Bearer header).
Useful for protecting API routes.

## Parameters

### token

`string`

### config

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

## Returns

`Promise`\<[`JWTPayload`](../../index/interfaces/JWTPayload.md)\>

## Throws

If the token is invalid, expired, or has wrong issuer/audience
