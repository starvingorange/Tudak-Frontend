import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postSignup } from "../api/postSignup";
import type { PostSignupRequest } from "../types/PostSignupRequest";
import type { PostSignupResponse } from "../types/PostSignupResponse";

export function usePostSignup(options?: {
  mutation?: UseMutationOptions<
    PostSignupResponse,
    ErrorType<unknown>,
    { data: BodyType<PostSignupRequest> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => postSignup(data, requestOptions),
    ...mutationOptions,
  });
}
