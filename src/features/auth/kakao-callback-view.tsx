"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef } from "react";
import { login } from "@/api/generated/auth-controller/auth-controller";
import {
  type CommonResponseLoginAuthResponse,
  LoginAuthRequestProviderType,
} from "@/api/generated/model";
import {
  clearStoredAccessToken,
  clearStoredSignupToken,
  setStoredAccessToken,
  setStoredSignupToken,
} from "@/lib/auth";

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

  const redirectToLogin = useEffectEvent((reason: string, detail?: unknown) => {
    console.error("[KakaoCallback] redirecting to /login:", reason, detail);
    router.replace("/login");
  });

  const handleLoginResponse = useEffectEvent(async (socialCode: string) => {
    try {
      const response = await login({
        providerType: LoginAuthRequestProviderType.KAKAO,
        socialCode,
      });
      const responseBody =
        response as unknown as CommonResponseLoginAuthResponse;
      const loginData = responseBody.data;

      if (!loginData) {
        redirectToLogin("login response body did not contain login data", {
          responseBody,
        });
        return;
      }

      if (loginData.isNewUser) {
        if (!loginData.signupToken) {
          redirectToLogin("new user response missing signupToken", loginData);
          return;
        }

        clearStoredAccessToken();
        setStoredSignupToken(loginData.signupToken);
        router.replace(
          `/onboarding?signupToken=${encodeURIComponent(loginData.signupToken)}`,
        );
        return;
      }

      if (!loginData.accessToken) {
        redirectToLogin(
          "existing user response missing accessToken",
          loginData,
        );
        return;
      }

      setStoredAccessToken(loginData.accessToken);
      clearStoredSignupToken();
      router.replace("/");
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
