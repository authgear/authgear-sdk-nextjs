[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [client](../README.md) / UseAuthgearReturn

# Interface: UseAuthgearReturn

Defined in: [src/hooks/useAuthgear.ts:9](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/hooks/useAuthgear.ts#L9)

## Properties

### isAuthenticated

> **isAuthenticated**: `boolean`

Defined in: [src/hooks/useAuthgear.ts:17](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/hooks/useAuthgear.ts#L17)

Whether the user is currently authenticated

***

### isLoaded

> **isLoaded**: `boolean`

Defined in: [src/hooks/useAuthgear.ts:15](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/hooks/useAuthgear.ts#L15)

Whether the initial session check has completed

***

### openPage()

> **openPage**: (`path`) => `void`

Defined in: [src/hooks/useAuthgear.ts:23](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/hooks/useAuthgear.ts#L23)

Open an Authgear page (e.g. Page.Settings) in a new tab

#### Parameters

##### path

`string`

#### Returns

`void`

***

### signIn()

> **signIn**: (`options?`) => `void`

Defined in: [src/hooks/useAuthgear.ts:19](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/hooks/useAuthgear.ts#L19)

Navigate to the sign-in page

#### Parameters

##### options?

[`SignInOptions`](SignInOptions.md)

#### Returns

`void`

***

### signOut()

> **signOut**: () => `void`

Defined in: [src/hooks/useAuthgear.ts:21](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/hooks/useAuthgear.ts#L21)

Navigate to the sign-out endpoint

#### Returns

`void`

***

### state

> **state**: [`SessionState`](../../index/enumerations/SessionState.md)

Defined in: [src/hooks/useAuthgear.ts:11](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/hooks/useAuthgear.ts#L11)

Current session state

***

### user

> **user**: [`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`

Defined in: [src/hooks/useAuthgear.ts:13](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/hooks/useAuthgear.ts#L13)

Current user info, null if not authenticated
