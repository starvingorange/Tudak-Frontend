import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postLogout } from "../api/postLogout";
import type { PostLogoutResponse } from "../types/PostLogoutResponse";

export function usePostLogout(options?: {
  mutation?: UseMutationOptions<PostLogoutResponse, ErrorType<unknown>, void>;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: () => postLogout(requestOptions),
    ...mutationOptions,
  });
}
