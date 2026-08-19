import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postVote } from "../api/postVote";
import type { PostVoteRequest } from "../types/PostVoteRequest";
import type { PostVoteResponse } from "../types/PostVoteResponse";

export function usePostVote(options?: {
  mutation?: UseMutationOptions<
    PostVoteResponse,
    ErrorType<unknown>,
    { data: BodyType<PostVoteRequest> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => postVote(data, requestOptions),
    ...mutationOptions,
  });
}
