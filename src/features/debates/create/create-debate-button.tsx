"use client";

import { Plus } from "lucide-react";
import type { MouseEvent } from "react";
import { useLoginGate } from "@/components/auth/use-login-gate";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/stores/auth-store";

export function CreateDebateButton() {
  const { requireLogin, loginModal } = useLoginGate(
    "토론방을 만들려면 로그인이 필요해요.",
  );

  return (
    <>
      <Button
        href={ROUTES.CREATE_DEBATE()}
        icon={<Plus size={20} />}
        className="mt-4 w-fit sm:mt-5"
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          if (!useAuthStore.getState().accessToken) {
            e.preventDefault();
            requireLogin();
          }
        }}
      >
        토론방 만들기
      </Button>
      {loginModal}
    </>
  );
}
