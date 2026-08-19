import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { patchReadAll } from "../api/patchReadAll";
import type { PatchReadAllResponse } from "../types/PatchReadAllResponse";

export function usePatchReadAll(options?: {
  mutation?: UseMutationOptions<PatchReadAllResponse, ErrorType<unknown>, void>;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: () => patchReadAll(requestOptions),
    ...mutationOptions,
  });
}
