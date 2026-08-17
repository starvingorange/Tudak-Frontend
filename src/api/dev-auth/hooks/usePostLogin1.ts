import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postLogin1 } from "../api/postLogin1";
import type { PostLogin1Request } from "../types/PostLogin1Request";
import type { PostLogin1Response } from "../types/PostLogin1Response";

export function usePostLogin1(options?: {
  mutation?: UseMutationOptions<
    PostLogin1Response,
    ErrorType<unknown>,
    { data: BodyType<PostLogin1Request> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => postLogin1(data, requestOptions),
    ...mutationOptions,
  });
}
