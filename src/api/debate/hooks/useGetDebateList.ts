import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import { withQueryKey } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getDebateList } from "../api/getDebateList";
import type { GetDebateListRequest as GetDebateListParams } from "../types/GetDebateListRequest";

export const getGetDebateListQueryKey = (params?: GetDebateListParams) => {
  return [`/api/debates`, ...(params ? [params] : [])] as const;
};

export const getGetDebateListQueryOptions = <
  TData = Awaited<ReturnType<typeof getDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: GetDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getDebateList>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetDebateListQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getDebateList>>> = ({
    signal,
  }) => getDebateList(params, { signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getDebateList>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type GetDebateListQueryResult = NonNullable<
  Awaited<ReturnType<typeof getDebateList>>
>;
export type GetDebateListQueryError = ErrorType<unknown>;

export function useGetDebateList<
  TData = Awaited<ReturnType<typeof getDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: GetDebateListParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getDebateList>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getDebateList>>,
          TError,
          Awaited<ReturnType<typeof getDebateList>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetDebateList<
  TData = Awaited<ReturnType<typeof getDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: GetDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getDebateList>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getDebateList>>,
          TError,
          Awaited<ReturnType<typeof getDebateList>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetDebateList<
  TData = Awaited<ReturnType<typeof getDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: GetDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getDebateList>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
/**
 * @summary 토론 목록 조회
 */

export function useGetDebateList<
  TData = Awaited<ReturnType<typeof getDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: GetDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getDebateList>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getGetDebateListQueryOptions(params, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}
