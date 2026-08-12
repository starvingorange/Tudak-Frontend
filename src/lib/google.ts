import { ROUTES } from "@/lib/routes";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const getGoogleRedirectUri = () => {
  if (process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return `${window.location.origin}${ROUTES.loginGoogleCallback()}`;
};

export const getGoogleAuthorizeUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = getGoogleRedirectUri();

  if (!clientId || !redirectUri) {
    return null;
  }

  const searchParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "profile",
  });

  return `${GOOGLE_AUTHORIZE_URL}?${searchParams.toString()}`;
};
