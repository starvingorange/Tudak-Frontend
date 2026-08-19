import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getViewDetails } from "../api/getViewDetails";
import type { GetViewDetailsResponse } from "../types/GetViewDetailsResponse";

export const getViewDetailsQueryKey = (pollId: number) =>
  [`/api/polls/${pollId}`] as const;

export const getViewDetailsQueryOptions = (
  pollId: number,
  options?: {
    query?: Partial<
      UseQueryOptions<GetViewDetailsResponse, ErrorType<unknown>>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getViewDetailsQueryKey(pollId),
    queryFn: ({ signal }) =>
      getViewDetails(pollId, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetViewDetailsResponse, ErrorType<unknown>>;
};

export function useGetViewDetails(
  pollId: number,
  options?: {
    query?: Partial<
      UseQueryOptions<GetViewDetailsResponse, ErrorType<unknown>>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getViewDetailsQueryOptions(pollId, options));
}
