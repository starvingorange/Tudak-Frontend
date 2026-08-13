import ky from "ky";
import { useAuthStore } from "@/stores/auth-store";

export const apiClient = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
  },
});
