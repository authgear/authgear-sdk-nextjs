# Function: currentUser()

> **currentUser**(`config`): `Promise`\<[`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`\>

Defined in: src/server.ts:34

Get the current user in a Server Component or Route Handler.
Returns null if not authenticated.

## Parameters

### config

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

## Returns

`Promise`\<[`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`\>
