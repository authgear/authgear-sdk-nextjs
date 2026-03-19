[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [server](../README.md) / currentUser

# Function: currentUser()

> **currentUser**(`config`): `Promise`\<[`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`\>

Defined in: [src/server.ts:68](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/server.ts#L68)

Get the current user in a Server Component or Route Handler.
Automatically refreshes the access token if expired, including persisting a
rotated refresh token when the Authgear project has refresh token rotation enabled.
Returns null if not authenticated or if the session cannot be refreshed.

## Parameters

### config

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

## Returns

`Promise`\<[`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`\>
