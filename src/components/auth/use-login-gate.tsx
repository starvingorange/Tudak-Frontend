"use client";

import { useState } from "react";
import { LoginRequiredModal } from "./login-required-modal";

export function useLoginGate(description?: string) {
  const [open, setOpen] = useState(false);

  return {
    requireLogin: () => setOpen(true),
    loginModal: open ? (
      <LoginRequiredModal
        onClose={() => setOpen(false)}
        description={description}
      />
    ) : null,
  };
}
