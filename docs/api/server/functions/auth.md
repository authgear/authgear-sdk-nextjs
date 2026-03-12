# Function: auth()

> **auth**(`config`): `Promise`\<[`Session`](../../index/interfaces/Session.md)\>

Defined in: src/server.ts:18

Read the current session in a Server Component or Route Handler.
Automatically refreshes the access token if expired.

## Parameters

### config

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

## Returns

`Promise`\<[`Session`](../../index/interfaces/Session.md)\>
