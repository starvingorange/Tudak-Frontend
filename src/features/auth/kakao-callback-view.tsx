"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef } from "react";
import { postLogin } from "@/api/auth/api/postLogin";
import { LoginAuthRequestProviderType } from "@/api/auth/types/LoginAuthRequestProviderType";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/stores/auth-store";

type KakaoCallbackViewProps = {
  authCode?: string;
  authError?: string;
};

export function KakaoCallbackView({
  authCode,
  authError,
}: KakaoCallbackViewProps) {
  const router = useRouter();
  const processedCodeRef = useRef<string | null>(null);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAccessToken = useAuthStore((s) => s.clearAccessToken);
  const setSignupToken = useAuthStore((s) => s.setSignupToken);
  const clearSignupToken = useAuthStore((s) => s.clearSignupToken);

  const redirectToLogin = useEffectEvent((reason: string, detail?: unknown) => {
    console.error("[KakaoCallback] redirecting to /login:", reason, detail);
    router.replace(ROUTES.login());
  });

  const handleLoginResponse = useEffectEvent(async (socialCode: string) => {
    try {
      const response = await postLogin({
        providerType: LoginAuthRequestProviderType.KAKAO,
        socialCode,
      });
      const loginData = response.data;

      if (!loginData) {
        redirectToLogin("login response body did not contain login data", {
          response,
        });
        return;
      }

      if (loginData.isNewUser) {
        if (!loginData.signupToken) {
          redirectToLogin("new user response missing signupToken", loginData);
          return;
        }

        clearAccessToken();
        setSignupToken(loginData.signupToken);
        router.replace(ROUTES.onboarding(loginData.signupToken));
        return;
      }

      if (!loginData.accessToken) {
        redirectToLogin(
          "existing user response missing accessToken",
          loginData,
        );
        return;
      }

      setAccessToken(loginData.accessToken);
      clearSignupToken();
      router.replace(ROUTES.home());
    } catch (error) {
      redirectToLogin("login request threw an error", error);
    }
  });

  useEffect(() => {
    if (authError || !authCode) {
      redirectToLogin("missing authCode or authError returned from kakao", {
        authCode,
        authError,
      });
      return;
    }

    if (processedCodeRef.current === authCode) {
      return;
    }

    processedCodeRef.current = authCode;
    void handleLoginResponse(authCode);
  }, [authCode, authError]);

  return null;
}
