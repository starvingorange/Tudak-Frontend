import { ROUTES } from "@/lib/routes";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export const getKakaoRedirectUri = () => {
  if (process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return `${window.location.origin}${ROUTES.LOGIN_KAKAO_CALLBACK()}`;
};

export const getKakaoAuthorizeUrl = () => {
  const clientId =
    process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  const redirectUri = getKakaoRedirectUri();

  if (!clientId || !redirectUri) {
    return null;
  }

  const searchParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  return `${KAKAO_AUTHORIZE_URL}?${searchParams.toString()}`;
};
