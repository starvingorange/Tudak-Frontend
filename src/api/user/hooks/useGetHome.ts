import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getHome } from "../api/getHome";
import type { GetHomeResponse } from "../types/GetHomeResponse";

export const getHomeQueryKey = () => [`/api/users/home`] as const;

export const getHomeQueryOptions = (options?: {
  query?: Partial<UseQueryOptions<GetHomeResponse, ErrorType<unknown>>>;
  request?: SecondParameter<typeof orvalApiClient>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getHomeQueryKey(),
    queryFn: ({ signal }) => getHome({ signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetHomeResponse, ErrorType<unknown>>;
};

export function useGetHome(options?: {
  query?: Partial<UseQueryOptions<GetHomeResponse, ErrorType<unknown>>>;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  return useQuery(getHomeQueryOptions(options));
}
