"use client";

import { Plus } from "lucide-react";
import { useLoginGate } from "@/components/auth/use-login-gate";
import { Button } from "@/components/ui/button";
import { getStoredAccessToken } from "@/lib/auth";

export function CreateDebateButton() {
  const { requireLogin, loginModal } = useLoginGate(
    "토론방을 만들려면 로그인이 필요해요.",
  );

  return (
    <>
      <Button
        href="/debates/new"
        icon={<Plus size={20} />}
        className="mt-4 w-fit sm:mt-5"
        onClick={(e) => {
          if (!getStoredAccessToken()) {
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
