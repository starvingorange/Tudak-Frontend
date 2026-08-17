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
import { getPreUpload1 as preUpload1 } from "../api/getPreUpload1";
import type { GetPreUpload1Request as PreUpload1Params } from "../types/GetPreUpload1Request";

export const getPreUpload1QueryKey = (params?: PreUpload1Params) => {
  return [`/api/users/my/profile-image`, ...(params ? [params] : [])] as const;
};

export const getPreUpload1QueryOptions = <
  TData = Awaited<ReturnType<typeof preUpload1>>,
  TError = ErrorType<unknown>,
>(
  params: PreUpload1Params,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload1>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getPreUpload1QueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof preUpload1>>> = ({
    signal,
  }) => preUpload1(params, { signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof preUpload1>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type PreUpload1QueryResult = NonNullable<
  Awaited<ReturnType<typeof preUpload1>>
>;
export type PreUpload1QueryError = ErrorType<unknown>;

export function useGetPreUpload1<
  TData = Awaited<ReturnType<typeof preUpload1>>,
  TError = ErrorType<unknown>,
>(
  params: PreUpload1Params,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload1>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof preUpload1>>,
          TError,
          Awaited<ReturnType<typeof preUpload1>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetPreUpload1<
  TData = Awaited<ReturnType<typeof preUpload1>>,
  TError = ErrorType<unknown>,
>(
  params: PreUpload1Params,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload1>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof preUpload1>>,
          TError,
          Awaited<ReturnType<typeof preUpload1>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetPreUpload1<
  TData = Awaited<ReturnType<typeof preUpload1>>,
  TError = ErrorType<unknown>,
>(
  params: PreUpload1Params,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload1>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useGetPreUpload1<
  TData = Awaited<ReturnType<typeof preUpload1>>,
  TError = ErrorType<unknown>,
>(
  params: PreUpload1Params,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload1>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getPreUpload1QueryOptions(params, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}
