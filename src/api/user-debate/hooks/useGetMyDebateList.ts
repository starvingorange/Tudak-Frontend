import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getMyDebateList } from "../api/getMyDebateList";
import type { GetMyDebateListRequest as MyDebateListParams } from "../types/GetMyDebateListRequest";
import type { GetMyDebateListResponse } from "../types/GetMyDebateListResponse";

export const getMyDebateListQueryKey = (params?: MyDebateListParams) =>
  [`/api/users/debates/my`, ...(params ? [params] : [])] as const;

export const getMyDebateListQueryOptions = (
  params: MyDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<GetMyDebateListResponse, ErrorType<unknown>>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getMyDebateListQueryKey(params),
    queryFn: ({ signal }) =>
      getMyDebateList(params, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetMyDebateListResponse, ErrorType<unknown>>;
};

export function useGetMyDebateList(
  params: MyDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<GetMyDebateListResponse, ErrorType<unknown>>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getMyDebateListQueryOptions(params, options));
}
