import type { Agreement } from "@/lib/ws/types";

function storageKey(debateId: string | number) {
  return `debate-agreement:${debateId}`;
}

// Handoff for the seat a client is about to claim, keyed by debateId, so the
// waiting room can read it without putting it in the URL (create-debate-form
// and join-modal set it right before navigating there).
export function setPendingAgreement(
  debateId: string | number,
  agreement: Agreement,
) {
  sessionStorage.setItem(storageKey(debateId), agreement);
}

// Single-use read — clears the entry so a stale value can't leak into a
// later visit to the same debateId.
export function takePendingAgreement(
  debateId: string | number,
): Agreement | undefined {
  const value = sessionStorage.getItem(storageKey(debateId));
  sessionStorage.removeItem(storageKey(debateId));
  return value === "AGREE" || value === "DISAGREE" ? value : undefined;
}
