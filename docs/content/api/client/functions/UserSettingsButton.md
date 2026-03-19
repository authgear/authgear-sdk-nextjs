[**@authgear/nextjs**](../../README.md)

***

[@authgear/nextjs](../../README.md) / [client](../README.md) / UserSettingsButton

# Function: UserSettingsButton()

> **UserSettingsButton**(`__namedParameters`): `Element`

Defined in: [src/components/UserSettingsButton.tsx:15](https://github.com/authgear/authgear-sdk-nextjs/blob/794ac199bdf94fec6449a3be3654fc9ec692e2b2/src/components/UserSettingsButton.tsx#L15)

A button that opens Authgear's account settings page in a new tab
for the currently authenticated user. Requires `AuthgearProvider` as an ancestor.

Uses `GET /api/auth/open?page=/settings` under the hood — no Server Action needed.

## Parameters

### \_\_namedParameters

[`UserSettingsButtonProps`](../type-aliases/UserSettingsButtonProps.md)

## Returns

`Element`
