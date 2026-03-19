[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [server](../README.md) / verifyAccessToken

# Function: verifyAccessToken()

> **verifyAccessToken**(`token`, `config`): `Promise`\<[`JWTPayload`](../../index/interfaces/JWTPayload.md)\>

Defined in: [src/server.ts:129](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/server.ts#L129)

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
