import type { UserInfo } from "./types.js";

/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
export function parseUserInfo(raw: Record<string, unknown>): UserInfo {
  return {
    sub: raw["sub"] as string,
    email: raw["email"] as string | undefined,
    emailVerified: raw["email_verified"] as boolean | undefined,
    phoneNumber: raw["phone_number"] as string | undefined,
    phoneNumberVerified: raw["phone_number_verified"] as boolean | undefined,
    preferredUsername: raw["preferred_username"] as string | undefined,
    givenName: raw["given_name"] as string | undefined,
    familyName: raw["family_name"] as string | undefined,
    name: raw["name"] as string | undefined,
    picture: raw["picture"] as string | undefined,
    roles: raw["https://authgear.com/claims/user/roles"] as
      | string[]
      | undefined,
    isAnonymous: raw["https://authgear.com/claims/user/is_anonymous"] as
      | boolean
      | undefined,
    isVerified: raw["https://authgear.com/claims/user/is_verified"] as
      | boolean
      | undefined,
    canReauthenticate: raw[
      "https://authgear.com/claims/user/can_reauthenticate"
    ] as boolean | undefined,
    customAttributes: raw["custom_attributes"] as
      | Record<string, unknown>
      | undefined,
    raw,
  };
}
/* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
