import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getDebateList } from "../api/getDebateList";
import type { GetDebateListRequest as GetDebateListParams } from "../types/GetDebateListRequest";
import type { GetDebateListResponse } from "../types/GetDebateListResponse";

export const getDebateListQueryKey = (params?: GetDebateListParams) =>
  [`/api/debates`, ...(params ? [params] : [])] as const;

export const getDebateListQueryOptions = (
  params: GetDebateListParams,
  options?: {
    query?: Partial<UseQueryOptions<GetDebateListResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getDebateListQueryKey(params),
    queryFn: ({ signal }) =>
      getDebateList(params, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetDebateListResponse, ErrorType<unknown>>;
};

/**
 * @summary 토론 목록 조회
 */
export function useGetDebateList(
  params: GetDebateListParams,
  options?: {
    query?: Partial<UseQueryOptions<GetDebateListResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getDebateListQueryOptions(params, options));
}
