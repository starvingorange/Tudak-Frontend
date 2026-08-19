import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getView } from "../api/getView";
import type { GetViewRequest as ViewParams } from "../types/GetViewRequest";
import type { GetViewResponse } from "../types/GetViewResponse";

export const getViewQueryKey = (params?: ViewParams) =>
  [`/api/polls`, ...(params ? [params] : [])] as const;

export const getViewQueryOptions = (
  params: ViewParams,
  options?: {
    query?: Partial<UseQueryOptions<GetViewResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getViewQueryKey(params),
    queryFn: ({ signal }) => getView(params, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetViewResponse, ErrorType<unknown>>;
};

export function useGetView(
  params: ViewParams,
  options?: {
    query?: Partial<UseQueryOptions<GetViewResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getViewQueryOptions(params, options));
}
