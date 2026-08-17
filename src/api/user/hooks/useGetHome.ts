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
import { getHome as home } from "../api/getHome";

export const getHomeQueryKey = () => {
  return [`/api/users/home`] as const;
};

export const getHomeQueryOptions = <
  TData = Awaited<ReturnType<typeof home>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof home>>, TError, TData>
  >;
  request?: SecondParameter<typeof orvalApiClient>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getHomeQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof home>>> = ({
    signal,
  }) => home({ signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof home>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type HomeQueryResult = NonNullable<Awaited<ReturnType<typeof home>>>;
export type HomeQueryError = ErrorType<unknown>;

export function useGetHome<
  TData = Awaited<ReturnType<typeof home>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof home>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof home>>,
          TError,
          Awaited<ReturnType<typeof home>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetHome<
  TData = Awaited<ReturnType<typeof home>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof home>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof home>>,
          TError,
          Awaited<ReturnType<typeof home>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetHome<
  TData = Awaited<ReturnType<typeof home>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof home>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useGetHome<
  TData = Awaited<ReturnType<typeof home>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof home>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getHomeQueryOptions(options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}
