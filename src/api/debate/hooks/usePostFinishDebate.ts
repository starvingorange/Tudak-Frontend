import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postFinishDebate } from "../api/postFinishDebate";
import type { PostFinishDebateRequest } from "../types/PostFinishDebateRequest";
import type { PostFinishDebateResponse } from "../types/PostFinishDebateResponse";

/**
 * @summary 토론 종료
 */
export function usePostFinishDebate(options?: {
  mutation?: UseMutationOptions<
    PostFinishDebateResponse,
    ErrorType<unknown>,
    { debateId: number; data: BodyType<PostFinishDebateRequest> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ debateId, data }) =>
      postFinishDebate(debateId, data, requestOptions),
    ...mutationOptions,
  });
}
