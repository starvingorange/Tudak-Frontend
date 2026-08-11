import ky from "ky";
import { getStoredAccessToken } from "@/lib/auth";

export const apiClient = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const accessToken = getStoredAccessToken();

        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
  },
});
