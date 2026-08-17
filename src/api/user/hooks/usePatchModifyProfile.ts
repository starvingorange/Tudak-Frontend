import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { patchModifyProfile } from "../api/patchModifyProfile";
import type { PatchModifyProfileRequest } from "../types/PatchModifyProfileRequest";
import type { PatchModifyProfileResponse } from "../types/PatchModifyProfileResponse";

export function usePatchModifyProfile(options?: {
  mutation?: UseMutationOptions<
    PatchModifyProfileResponse,
    ErrorType<unknown>,
    { data: BodyType<PatchModifyProfileRequest> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => patchModifyProfile(data, requestOptions),
    ...mutationOptions,
  });
}
