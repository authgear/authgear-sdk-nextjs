"use client";

import React, { type ButtonHTMLAttributes } from "react";
import { useAuthgearContext } from "./AuthgearProvider.js";
import { Page } from "../types.js";

export type UserSettingsButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * A button that opens Authgear's account settings page in a new tab
 * for the currently authenticated user. Requires `AuthgearProvider` as an ancestor.
 *
 * Uses `GET /api/auth/open?page=/settings` under the hood — no Server Action needed.
 */
export function UserSettingsButton({
  children = "Account Settings",
  ...props
}: UserSettingsButtonProps): React.JSX.Element {
  const { openPage } = useAuthgearContext();
  return (
    <button type="button" {...props} onClick={(e) => { props.onClick?.(e); openPage(Page.Settings); }}>
      {children}
    </button>
  );
}
