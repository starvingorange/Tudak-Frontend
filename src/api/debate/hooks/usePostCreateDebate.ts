import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postCreateDebate } from "../api/postCreateDebate";
import type { PostCreateDebateRequest } from "../types/PostCreateDebateRequest";
import type { PostCreateDebateResponse } from "../types/PostCreateDebateResponse";

/**
 * @summary 토론 생성
 */
export function usePostCreateDebate(options?: {
  mutation?: UseMutationOptions<
    PostCreateDebateResponse,
    ErrorType<unknown>,
    { data: BodyType<PostCreateDebateRequest> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => postCreateDebate(data, requestOptions),
    ...mutationOptions,
  });
}
