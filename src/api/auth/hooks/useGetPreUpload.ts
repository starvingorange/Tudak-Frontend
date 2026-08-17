import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getPreUpload } from "../api/getPreUpload";
import type { GetPreUploadRequest as PreUploadParams } from "../types/GetPreUploadRequest";
import type { GetPreUploadResponse } from "../types/GetPreUploadResponse";

export const getPreUploadQueryKey = (params?: PreUploadParams) =>
  [`/auth/signup/profile-image`, ...(params ? [params] : [])] as const;

export const getPreUploadQueryOptions = (
  params: PreUploadParams,
  options?: {
    query?: Partial<UseQueryOptions<GetPreUploadResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getPreUploadQueryKey(params),
    queryFn: ({ signal }) =>
      getPreUpload(params, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetPreUploadResponse, ErrorType<unknown>>;
};

export function useGetPreUpload(
  params: PreUploadParams,
  options?: {
    query?: Partial<UseQueryOptions<GetPreUploadResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getPreUploadQueryOptions(params, options));
}
