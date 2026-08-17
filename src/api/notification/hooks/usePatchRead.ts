import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { patchRead } from "../api/patchRead";
import type { PatchReadResponse } from "../types/PatchReadResponse";

export function usePatchRead(options?: {
  mutation?: UseMutationOptions<PatchReadResponse, ErrorType<unknown>, number>;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: (notificationId) => patchRead(notificationId, requestOptions),
    ...mutationOptions,
  });
}
