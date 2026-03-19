[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [client](../README.md) / UserSettingsButton

# Function: UserSettingsButton()

> **UserSettingsButton**(`__namedParameters`): `Element`

Defined in: [src/components/UserSettingsButton.tsx:15](https://github.com/authgear/authgear-sdk-nextjs/blob/926a8f2e1423ad6cdd2a462cf4a9405e4972f5b0/src/components/UserSettingsButton.tsx#L15)

A button that opens Authgear's account settings page in a new tab
for the currently authenticated user. Requires `AuthgearProvider` as an ancestor.

Uses `GET /api/auth/open?page=/settings` under the hood — no Server Action needed.

## Parameters

### \_\_namedParameters

[`UserSettingsButtonProps`](../type-aliases/UserSettingsButtonProps.md)

## Returns

`Element`
