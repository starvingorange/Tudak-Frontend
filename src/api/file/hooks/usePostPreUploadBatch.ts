import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postPreUploadBatch } from "../api/postPreUploadBatch";
import type { PostPreUploadBatchRequest } from "../types/PostPreUploadBatchRequest";
import type { PostPreUploadBatchResponse } from "../types/PostPreUploadBatchResponse";

export function usePostPreUploadBatch(options?: {
  mutation?: UseMutationOptions<
    PostPreUploadBatchResponse,
    ErrorType<unknown>,
    { data: BodyType<PostPreUploadBatchRequest> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => postPreUploadBatch(data, requestOptions),
    ...mutationOptions,
  });
}
