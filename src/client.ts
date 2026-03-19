"use client";

export { AuthgearProvider } from "./components/AuthgearProvider.js";
export type { AuthgearProviderProps, SignInOptions } from "./components/AuthgearProvider.js";
export { SignInButton } from "./components/SignInButton.js";
export type { SignInButtonProps } from "./components/SignInButton.js";
export { SignOutButton } from "./components/SignOutButton.js";
export type { SignOutButtonProps } from "./components/SignOutButton.js";
export { UserSettingsButton } from "./components/UserSettingsButton.js";
export type { UserSettingsButtonProps } from "./components/UserSettingsButton.js";
export { useAuthgear } from "./hooks/useAuthgear.js";
export type { UseAuthgearReturn } from "./hooks/useAuthgear.js";
export { useUser } from "./hooks/useUser.js";
export { SessionState, PromptOption, Page } from "./types.js";
export type { UserInfo, Session } from "./types.js";
