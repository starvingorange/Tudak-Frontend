import type { Agreement } from "@/lib/ws/types";

/** Every navigable path in the app, in one place — mirrors src/app's route
 * tree 1:1. Add a new page, add its builder here. */
export const ROUTES = {
  home: () => "/",
  votes: () => "/votes",
  debates: () => "/debates",
  createDebate: () => "/debates/new",
  debateDetail: (debateId: string | number) => `/debates/${debateId}`,
  debateResult: (debateId: string | number) => `/debates/${debateId}/result`,
  debateWaiting: (debateId: string | number, agreement?: Agreement) =>
    agreement
      ? `/debates/${debateId}/waiting?agreement=${agreement}`
      : `/debates/${debateId}/waiting`,
  myPage: () => "/mypage",
  myPageDebates: () => "/mypage/debates",
  myPageVotes: () => "/mypage/votes",
  login: () => "/login",
  loginKakaoCallback: () => "/login/kakao/callback",
  loginGoogleCallback: () => "/login/google/callback",
  onboarding: (signupToken?: string) =>
    signupToken
      ? `/onboarding?signupToken=${encodeURIComponent(signupToken)}`
      : "/onboarding",
} as const;
