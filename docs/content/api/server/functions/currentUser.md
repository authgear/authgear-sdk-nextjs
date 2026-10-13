[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [server](../README.md) / currentUser

# Function: currentUser()

> **currentUser**(`config`): `Promise`\<[`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`\>

Defined in: [src/server.ts:112](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/server.ts#L112)

Get the current user in a Server Component or Route Handler.
Automatically refreshes the access token if expired, including persisting a
rotated refresh token when the Authgear project has refresh token rotation enabled.
Returns null if not authenticated or if the session cannot be refreshed.

## Parameters

### config

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

## Returns

`Promise`\<[`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`\>
