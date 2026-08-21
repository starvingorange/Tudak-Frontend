/** Every navigable path in the app, in one place — mirrors src/app's route
 * tree 1:1. Add a new page, add its builder here. */
export const ROUTES = {
  HOME: () => "/",
  VOTES: () => "/votes",
  DEBATES: () => "/debates",
  CREATE_DEBATE: () => "/debates/new",
  DEBATE_DETAIL: (debateId: string | number) => `/debates/${debateId}`,
  DEBATE_RESULT: (debateId: string | number) => `/debates/${debateId}/result`,
  // The seat a client claims travels via setPendingAgreement (sessionStorage),
  // not a URL param — see src/lib/pending-debate-agreement.ts.
  DEBATE_WAITING: (debateId: string | number) => `/debates/${debateId}/waiting`,
  MY_PAGE: () => "/mypage",
  MY_PAGE_DEBATES: () => "/mypage/debates",
  MY_PAGE_VOTES: () => "/mypage/votes",
  LOGIN: () => "/login",
  LOGIN_KAKAO_CALLBACK: () => "/login/kakao/callback",
  LOGIN_GOOGLE_CALLBACK: () => "/login/google/callback",
  ONBOARDING: (signupToken?: string) =>
    signupToken
      ? `/onboarding?signupToken=${encodeURIComponent(signupToken)}`
      : "/onboarding",
} as const;
