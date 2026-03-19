[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [index](../README.md) / PromptOption

# Enumeration: PromptOption

Defined in: [src/types.ts:43](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L43)

OIDC `prompt` parameter values.
Pass to `signIn({ prompt })` or `SignInButton signInOptions={{ prompt }}` to control
whether Authgear shows the login form for a specific authentication call.

## See

https://docs.authgear.com/authentication-and-access/single-sign-on/force-authgear-to-show-login-page

## Enumeration Members

### Login

> **Login**: `"login"`

Defined in: [src/types.ts:45](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L45)

Always show the login form, even if the user has an active Authgear session.

***

### None

> **None**: `"none"`

Defined in: [src/types.ts:47](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/types.ts#L47)

Never show the login form; return an error if the user is not already authenticated.
