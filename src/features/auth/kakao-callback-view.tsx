"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef } from "react";
import { login } from "@/api/generated/auth-controller/auth-controller";
import { LoginAuthRequestProviderType } from "@/api/generated/model";
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

type FlatLoginResponse = {
  accessToken?: string;
  signupToken?: string;
  isNewUser?: boolean;
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
      console.log("[KakaoCallback] sending login request", {
        providerType: LoginAuthRequestProviderType.KAKAO,
        socialCode,
      });

      const response = await login({
        providerType: LoginAuthRequestProviderType.KAKAO,
        socialCode,
      });
      const responseBody = response.data;
      const wrappedLoginData = responseBody.data;
      const flatLoginData =
        wrappedLoginData ??
        ((responseBody as FlatLoginResponse | undefined)?.accessToken !==
          undefined ||
        (responseBody as FlatLoginResponse | undefined)?.signupToken !==
          undefined ||
        (responseBody as FlatLoginResponse | undefined)?.isNewUser !== undefined
          ? (responseBody as FlatLoginResponse)
          : undefined);
      const loginData = flatLoginData;

      console.log("[KakaoCallback] login response", responseBody);

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
        console.log("[KakaoCallback] redirecting to onboarding", {
          isNewUser: loginData.isNewUser,
        });
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
      console.log("[KakaoCallback] redirecting to /");
      router.replace("/");
    } catch (error) {
      redirectToLogin("login request threw an error", error);
    }
  });

  useEffect(() => {
    console.log("[KakaoCallback] callback params", {
      authCode,
      authError,
    });

    if (authError || !authCode) {
      redirectToLogin("missing authCode or authError returned from kakao", {
        authCode,
        authError,
      });
      return;
    }

    if (processedCodeRef.current === authCode) {
      console.log("[KakaoCallback] auth code already processed");
      return;
    }

    processedCodeRef.current = authCode;
    void handleLoginResponse(authCode);
  }, [authCode, authError]);

  return null;
}
