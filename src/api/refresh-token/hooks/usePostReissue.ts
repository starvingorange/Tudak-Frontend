import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postReissue } from "../api/postReissue";
import type { PostReissueResponse } from "../types/PostReissueResponse";

export function usePostReissue(options?: {
  mutation?: UseMutationOptions<PostReissueResponse, ErrorType<unknown>, void>;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: () => postReissue(requestOptions),
    ...mutationOptions,
  });
}
