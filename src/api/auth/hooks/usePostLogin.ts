import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postLogin } from "../api/postLogin";
import type { PostLoginRequest } from "../types/PostLoginRequest";
import type { PostLoginResponse } from "../types/PostLoginResponse";

export function usePostLogin(options?: {
  mutation?: UseMutationOptions<
    PostLoginResponse,
    ErrorType<unknown>,
    { data: BodyType<PostLoginRequest> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => postLogin(data, requestOptions),
    ...mutationOptions,
  });
}
