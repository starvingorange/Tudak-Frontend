import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getDebate } from "../api/getDebate";
import type { GetDebateResponse } from "../types/GetDebateResponse";

export const getDebateQueryKey = (debateId: number) =>
  [`/api/debates/${debateId}`] as const;

export const getDebateQueryOptions = (
  debateId: number,
  options?: {
    query?: Partial<UseQueryOptions<GetDebateResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getDebateQueryKey(debateId),
    queryFn: ({ signal }) => getDebate(debateId, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetDebateResponse, ErrorType<unknown>>;
};

/**
 * @summary 토론 상세 조회
 */
export function useGetDebate(
  debateId: number,
  options?: {
    query?: Partial<UseQueryOptions<GetDebateResponse, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getDebateQueryOptions(debateId, options));
}
