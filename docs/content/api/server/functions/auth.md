[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [server](../README.md) / auth

# Function: auth()

> **auth**(`config`): `Promise`\<[`Session`](../../index/interfaces/Session.md)\>

Defined in: [src/server.ts:19](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/server.ts#L19)

Read the current session in a Server Component, Route Handler, or Server Action.
Automatically refreshes the access token if expired, so `session.accessToken` is
always valid when the session state is `Authenticated`. Use this when you need a
fresh access token to call a downstream API (e.g. inside a Server Action).

## Parameters

### config

[`AuthgearConfig`](../../index/interfaces/AuthgearConfig.md)

## Returns

`Promise`\<[`Session`](../../index/interfaces/Session.md)\>
