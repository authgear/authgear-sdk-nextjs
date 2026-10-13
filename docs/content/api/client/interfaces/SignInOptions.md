[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [client](../README.md) / SignInOptions

# Interface: SignInOptions

Defined in: [src/components/AuthgearProvider.tsx:24](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/components/AuthgearProvider.tsx#L24)

## Properties

### loginPath?

> `optional` **loginPath**: `string`

Defined in: [src/components/AuthgearProvider.tsx:26](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/components/AuthgearProvider.tsx#L26)

***

### prompt?

> `optional` **prompt**: `string`

Defined in: [src/components/AuthgearProvider.tsx:32](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/components/AuthgearProvider.tsx#L32)

OIDC `prompt` parameter for this sign-in call.
Overrides the global `isSSOEnabled` setting for this navigation.
Use `PromptOption.Login` or `PromptOption.None` for type-safe values.

***

### returnTo?

> `optional` **returnTo**: `string`

Defined in: [src/components/AuthgearProvider.tsx:25](https://github.com/authgear/authgear-sdk-nextjs/blob/dcdfbc18357eb721b35950fa2c4b56dd7dbe6c07/src/components/AuthgearProvider.tsx#L25)
