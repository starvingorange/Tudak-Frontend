import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { BodyType, ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { postPreUpload } from "../api/postPreUpload";
import type { PostPreUploadRequest } from "../types/PostPreUploadRequest";
import type { PostPreUploadResponse } from "../types/PostPreUploadResponse";

export function usePostPreUpload(options?: {
  mutation?: UseMutationOptions<
    PostPreUploadResponse,
    ErrorType<unknown>,
    { data: BodyType<PostPreUploadRequest> }
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ data }) => postPreUpload(data, requestOptions),
    ...mutationOptions,
  });
}
