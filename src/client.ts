"use client";

export {
  AuthgearProvider,
  type AuthgearProviderProps,
  type SignInOptions,
} from "./components/AuthgearProvider.js";
export {
  SignInButton,
  type SignInButtonProps,
} from "./components/SignInButton.js";
export {
  SignOutButton,
  type SignOutButtonProps,
} from "./components/SignOutButton.js";
export {
  UserSettingsButton,
  type UserSettingsButtonProps,
} from "./components/UserSettingsButton.js";
export { useAuthgear, type UseAuthgearReturn } from "./hooks/useAuthgear.js";
export { useUser } from "./hooks/useUser.js";
export {
  SessionState,
  PromptOption,
  Page,
  type UserInfo,
  type Session,
} from "./types.js";
