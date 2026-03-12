# Function: verifyAccessToken()

> **verifyAccessToken**(`token`, `config`): `Promise`\<[`JWTPayload`](../../index/interfaces/JWTPayload.md)\>

Defined in: src/server.ts:81

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
