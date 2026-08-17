import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getPreUpload1 } from "../api/getPreUpload1";
import type { GetPreUpload1Request as PreUpload1Params } from "../types/GetPreUpload1Request";
import type { GetPreUpload1Response } from "../types/GetPreUpload1Response";

export const getPreUpload1QueryKey = (params?: PreUpload1Params) =>
  [`/auth/signup/profile-image`, ...(params ? [params] : [])] as const;

export const getPreUpload1QueryOptions = (
  params: PreUpload1Params,
  options?: {
    query?: Partial<UseQueryOptions<GetPreUpload1Response, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getPreUpload1QueryKey(params),
    queryFn: ({ signal }) =>
      getPreUpload1(params, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetPreUpload1Response, ErrorType<unknown>>;
};

export function useGetPreUpload1(
  params: PreUpload1Params,
  options?: {
    query?: Partial<UseQueryOptions<GetPreUpload1Response, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getPreUpload1QueryOptions(params, options));
}
