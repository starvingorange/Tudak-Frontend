"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef } from "react";
import { postLogin } from "@/api/auth/api/postLogin";
import { LoginAuthRequestProviderType } from "@/api/auth/types/LoginAuthRequestProviderType";
import {
  clearStoredAccessToken,
  clearStoredSignupToken,
  setStoredAccessToken,
  setStoredSignupToken,
} from "@/lib/auth";

type GoogleCallbackViewProps = {
  authCode?: string;
  authError?: string;
};

export function GoogleCallbackView({
  authCode,
  authError,
}: GoogleCallbackViewProps) {
  const router = useRouter();
  const processedCodeRef = useRef<string | null>(null);

  const redirectToLogin = useEffectEvent((reason: string, detail?: unknown) => {
    console.error("[GoogleCallback] redirecting to /login:", reason, detail);
    router.replace("/login");
  });

  const handleLoginResponse = useEffectEvent(async (socialCode: string) => {
    try {
      const response = await postLogin({
        providerType: LoginAuthRequestProviderType.GOOGLE,
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
      redirectToLogin("missing authCode or authError returned from google", {
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
