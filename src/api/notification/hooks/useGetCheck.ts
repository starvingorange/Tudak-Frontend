import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getCheck } from "../api/getCheck";
import type { GetCheckResponse } from "../types/GetCheckResponse";

export const getCheckQueryKey = () => [`/api/notifications/check`] as const;

export const getCheckQueryOptions = (options?: {
  query?: Partial<UseQueryOptions<GetCheckResponse, ErrorType<unknown>>>;
  request?: SecondParameter<typeof orvalApiClient>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getCheckQueryKey(),
    queryFn: ({ signal }) => getCheck({ signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetCheckResponse, ErrorType<unknown>>;
};

export function useGetCheck(options?: {
  query?: Partial<UseQueryOptions<GetCheckResponse, ErrorType<unknown>>>;
  request?: SecondParameter<typeof orvalApiClient>;
}) {
  return useQuery(getCheckQueryOptions(options));
}
