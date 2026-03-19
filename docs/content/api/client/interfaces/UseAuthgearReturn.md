[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [client](../README.md) / UseAuthgearReturn

# Interface: UseAuthgearReturn

Defined in: [src/hooks/useAuthgear.ts:6](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/hooks/useAuthgear.ts#L6)

## Properties

### isAuthenticated

> **isAuthenticated**: `boolean`

Defined in: [src/hooks/useAuthgear.ts:14](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/hooks/useAuthgear.ts#L14)

Whether the user is currently authenticated

***

### isLoaded

> **isLoaded**: `boolean`

Defined in: [src/hooks/useAuthgear.ts:12](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/hooks/useAuthgear.ts#L12)

Whether the initial session check has completed

***

### openPage()

> **openPage**: (`path`) => `void`

Defined in: [src/hooks/useAuthgear.ts:20](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/hooks/useAuthgear.ts#L20)

Open an Authgear page (e.g. Page.Settings) in a new tab

#### Parameters

##### path

`string`

#### Returns

`void`

***

### signIn()

> **signIn**: (`options?`) => `void`

Defined in: [src/hooks/useAuthgear.ts:16](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/hooks/useAuthgear.ts#L16)

Navigate to the sign-in page

#### Parameters

##### options?

[`SignInOptions`](SignInOptions.md)

#### Returns

`void`

***

### signOut()

> **signOut**: () => `void`

Defined in: [src/hooks/useAuthgear.ts:18](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/hooks/useAuthgear.ts#L18)

Navigate to the sign-out endpoint

#### Returns

`void`

***

### state

> **state**: [`SessionState`](../../index/enumerations/SessionState.md)

Defined in: [src/hooks/useAuthgear.ts:8](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/hooks/useAuthgear.ts#L8)

Current session state

***

### user

> **user**: [`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`

Defined in: [src/hooks/useAuthgear.ts:10](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/hooks/useAuthgear.ts#L10)

Current user info, null if not authenticated
