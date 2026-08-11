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
      console.log("[GoogleCallback] sending login request", {
        providerType: LoginAuthRequestProviderType.GOOGLE,
        socialCode,
      });

      const response = await login({
        providerType: LoginAuthRequestProviderType.GOOGLE,
        socialCode,
      });
      const responseBody =
        response as unknown as CommonResponseLoginAuthResponse;
      const loginData = responseBody.data;

      console.log("[GoogleCallback] login response", responseBody);

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
        console.log("[GoogleCallback] redirecting to onboarding", {
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
      console.log("[GoogleCallback] redirecting to /");
      router.replace("/");
    } catch (error) {
      redirectToLogin("login request threw an error", error);
    }
  });

  useEffect(() => {
    console.log("[GoogleCallback] callback params", {
      authCode,
      authError,
    });

    if (authError || !authCode) {
      redirectToLogin("missing authCode or authError returned from google", {
        authCode,
        authError,
      });
      return;
    }

    if (processedCodeRef.current === authCode) {
      console.log("[GoogleCallback] auth code already processed");
      return;
    }

    processedCodeRef.current = authCode;
    void handleLoginResponse(authCode);
  }, [authCode, authError]);

  return null;
}
