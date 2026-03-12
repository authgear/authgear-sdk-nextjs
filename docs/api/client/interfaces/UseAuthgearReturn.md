# Interface: UseAuthgearReturn

Defined in: src/hooks/useAuthgear.ts:6

## Properties

### isAuthenticated

> **isAuthenticated**: `boolean`

Defined in: src/hooks/useAuthgear.ts:14

Whether the user is currently authenticated

***

### isLoaded

> **isLoaded**: `boolean`

Defined in: src/hooks/useAuthgear.ts:12

Whether the initial session check has completed

***

### signIn()

> **signIn**: (`options?`) => `void`

Defined in: src/hooks/useAuthgear.ts:16

Navigate to the sign-in page

#### Parameters

##### options?

[`SignInOptions`](SignInOptions.md)

#### Returns

`void`

***

### signOut()

> **signOut**: () => `void`

Defined in: src/hooks/useAuthgear.ts:18

Navigate to the sign-out endpoint

#### Returns

`void`

***

### state

> **state**: [`SessionState`](../../index/enumerations/SessionState.md)

Defined in: src/hooks/useAuthgear.ts:8

Current session state

***

### user

> **user**: [`UserInfo`](../../index/interfaces/UserInfo.md) \| `null`

Defined in: src/hooks/useAuthgear.ts:10

Current user info, null if not authenticated
