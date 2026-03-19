[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [client](../README.md) / SignInOptions

# Interface: SignInOptions

Defined in: [src/components/AuthgearProvider.tsx:23](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/components/AuthgearProvider.tsx#L23)

## Properties

### loginPath?

> `optional` **loginPath**: `string`

Defined in: [src/components/AuthgearProvider.tsx:25](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/components/AuthgearProvider.tsx#L25)

***

### prompt?

> `optional` **prompt**: `string`

Defined in: [src/components/AuthgearProvider.tsx:31](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/components/AuthgearProvider.tsx#L31)

OIDC `prompt` parameter for this sign-in call.
Overrides the global `isSSOEnabled` setting for this navigation.
Use `PromptOption.Login` or `PromptOption.None` for type-safe values.

***

### returnTo?

> `optional` **returnTo**: `string`

Defined in: [src/components/AuthgearProvider.tsx:24](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/components/AuthgearProvider.tsx#L24)
