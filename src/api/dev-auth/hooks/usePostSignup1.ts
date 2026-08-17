import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postSignup1 } from "../api/postSignup1";
import type { PostSignup1Request } from "../types/PostSignup1Request";
import type { PostSignup1Response } from "../types/PostSignup1Response";

export function usePostSignup1(options?: {
  mutation?: UseMutationOptions<
    PostSignup1Response,
    ErrorType<unknown>,
    { data: BodyType<PostSignup1Request> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => postSignup1(data, requestOptions),
    ...mutationOptions,
  });
}
