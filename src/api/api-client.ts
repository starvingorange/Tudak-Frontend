import ky from "ky";
import type { PostReissueResponse } from "@/api/refresh-token/types/PostReissueResponse";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "@/lib/auth";

// Separate instance (no hooks) so a failed reissue call can't re-trigger
// apiClient's own 401 handling and deadlock on itself.
const reissueClient = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});

let reissuePromise: Promise<string | null> | null = null;

// Dedupes concurrent 401s into a single reissue call.
function reissueAccessToken(): Promise<string | null> {
  if (!reissuePromise) {
    reissuePromise = reissueClient
      .post("api/refresh-tokens/reissue")
      .json<PostReissueResponse>()
      .then((response) => {
        const accessToken = response.data?.accessToken;
        if (accessToken) {
          setStoredAccessToken(accessToken);
        }
        return accessToken ?? null;
      })
      .catch(() => null)
      .finally(() => {
        reissuePromise = null;
      });
  }

  return reissuePromise;
}

function redirectToLogin() {
  clearStoredAccessToken();
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

export const apiClient = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  credentials: "include",
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const accessToken = getStoredAccessToken();

        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async ({ request, response, retryCount }) => {
        if (response.status !== 401) {
          return;
        }

        if (retryCount > 0) {
          redirectToLogin();
          return;
        }

        const newAccessToken = await reissueAccessToken();

        if (!newAccessToken) {
          redirectToLogin();
          return;
        }

        const headers = new Headers(request.headers);
        headers.set("Authorization", `Bearer ${newAccessToken}`);

        return ky.retry({ request: new Request(request, { headers }) });
      },
    ],
  },
});

export { reissueAccessToken };

// Shared by AuthGuard and Navbar so they can't drift into different
// definitions of "logged in" (e.g. one checking localStorage only).
export async function isAuthenticated(): Promise<boolean> {
  if (getStoredAccessToken()) {
    return true;
  }

  return !!(await reissueAccessToken());
}
