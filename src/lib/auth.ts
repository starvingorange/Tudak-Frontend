const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const SIGNUP_TOKEN_STORAGE_KEY = "tudack.signup-token";

const canUseStorage = () => typeof window !== "undefined";

export const getStoredAccessToken = () => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const setStoredAccessToken = (accessToken: string) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
};

export const clearStoredAccessToken = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const getStoredSignupToken = () => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(SIGNUP_TOKEN_STORAGE_KEY);
};

export const setStoredSignupToken = (signupToken: string) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SIGNUP_TOKEN_STORAGE_KEY, signupToken);
};

export const clearStoredSignupToken = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SIGNUP_TOKEN_STORAGE_KEY);
};
