import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getMyPollList } from "../api/getMyPollList";
import type { GetMyPollListRequest as MyPollListParams } from "../types/GetMyPollListRequest";
import type { GetMyPollListResponse } from "../types/GetMyPollListResponse";

export const getMyPollListQueryKey = (params?: MyPollListParams) =>
  [`/api/users/polls/my`, ...(params ? [params] : [])] as const;

export const getMyPollListQueryOptions = (
  params: MyPollListParams,
  options?: {
    query?: Partial<UseQueryOptions<GetMyPollListResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getMyPollListQueryKey(params),
    queryFn: ({ signal }) =>
      getMyPollList(params, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetMyPollListResponse, ErrorType<unknown>>;
};

export function useGetMyPollList(
  params: MyPollListParams,
  options?: {
    query?: Partial<UseQueryOptions<GetMyPollListResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getMyPollListQueryOptions(params, options));
}
