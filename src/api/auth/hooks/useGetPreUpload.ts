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
import { getPreUpload as preUpload } from "../api/getPreUpload";
import type { GetPreUploadRequest as PreUploadParams } from "../types/GetPreUploadRequest";

export const getPreUploadQueryKey = (params?: PreUploadParams) => {
  return [`/auth/signup/profile-image`, ...(params ? [params] : [])] as const;
};

export const getPreUploadQueryOptions = <
  TData = Awaited<ReturnType<typeof preUpload>>,
  TError = ErrorType<unknown>,
>(
  params: PreUploadParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getPreUploadQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof preUpload>>> = ({
    signal,
  }) => preUpload(params, { signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof preUpload>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type PreUploadQueryResult = NonNullable<
  Awaited<ReturnType<typeof preUpload>>
>;
export type PreUploadQueryError = ErrorType<unknown>;

export function useGetPreUpload<
  TData = Awaited<ReturnType<typeof preUpload>>,
  TError = ErrorType<unknown>,
>(
  params: PreUploadParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof preUpload>>,
          TError,
          Awaited<ReturnType<typeof preUpload>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetPreUpload<
  TData = Awaited<ReturnType<typeof preUpload>>,
  TError = ErrorType<unknown>,
>(
  params: PreUploadParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof preUpload>>,
          TError,
          Awaited<ReturnType<typeof preUpload>>
        >,
        "initialData"
      >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};
export function useGetPreUpload<
  TData = Awaited<ReturnType<typeof preUpload>>,
  TError = ErrorType<unknown>,
>(
  params: PreUploadParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
};

export function useGetPreUpload<
  TData = Awaited<ReturnType<typeof preUpload>>,
  TError = ErrorType<unknown>,
>(
  params: PreUploadParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof preUpload>>, TError, TData>
    >;
    request?: SecondParameter<typeof orvalApiClient>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>;
} {
  const queryOptions = getPreUploadQueryOptions(params, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}
