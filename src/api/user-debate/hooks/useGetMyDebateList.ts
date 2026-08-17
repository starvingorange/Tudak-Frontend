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
import { getMyDebateList as myDebateList } from "../api/getMyDebateList";
import type { GetMyDebateListRequest as MyDebateListParams } from "../types/GetMyDebateListRequest";

export const getMyDebateListQueryKey = (params?: MyDebateListParams) => {
  return [`/api/users/debates/my`, ...(params ? [params] : [])] as const;
};

export const getMyDebateListQueryOptions = <
  TData = Awaited<ReturnType<typeof myDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: MyDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof myDebateList>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getMyDebateListQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof myDebateList>>> = ({
    signal,
  }) => myDebateList(params, { signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof myDebateList>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type MyDebateListQueryResult = NonNullable<
  Awaited<ReturnType<typeof myDebateList>>
>;
export type MyDebateListQueryError = ErrorType<unknown>;

export function useGetMyDebateList<
  TData = Awaited<ReturnType<typeof myDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: MyDebateListParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof myDebateList>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof myDebateList>>,
          TError,
          Awaited<ReturnType<typeof myDebateList>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetMyDebateList<
  TData = Awaited<ReturnType<typeof myDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: MyDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof myDebateList>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof myDebateList>>,
          TError,
          Awaited<ReturnType<typeof myDebateList>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetMyDebateList<
  TData = Awaited<ReturnType<typeof myDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: MyDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof myDebateList>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useGetMyDebateList<
  TData = Awaited<ReturnType<typeof myDebateList>>,
  TError = ErrorType<unknown>,
>(
  params: MyDebateListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof myDebateList>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getMyDebateListQueryOptions(params, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}
