import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getMyPage } from "../api/getMyPage";
import type { GetMyPageResponse } from "../types/GetMyPageResponse";

export const getMyPageQueryKey = () => [`/api/users/my`] as const;

export const getMyPageQueryOptions = (options?: {
  query?: Partial<UseQueryOptions<GetMyPageResponse, ErrorType<unknown>>>;
  request?: SecondParameter<typeof orvalApiClient>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getMyPageQueryKey(),
    queryFn: ({ signal }) => getMyPage({ signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetMyPageResponse, ErrorType<unknown>>;
};

export function useGetMyPage(options?: {
  query?: Partial<UseQueryOptions<GetMyPageResponse, ErrorType<unknown>>>;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  return useQuery(getMyPageQueryOptions(options));
}
