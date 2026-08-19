import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { SecondParameter } from "@/api/common/query-helpers";
import type { ErrorType, orvalApiClient } from "@/api/orval-mutator";
import { getView1 } from "../api/getView1";
import type { GetView1Request as View1Params } from "../types/GetView1Request";
import type { GetView1Response } from "../types/GetView1Response";

export const getView1QueryKey = (params?: View1Params) =>
  [`/api/notifications`, ...(params ? [params] : [])] as const;

export const getView1QueryOptions = (
  params: View1Params,
  options?: {
    query?: Partial<UseQueryOptions<GetView1Response, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  return {
    queryKey: getView1QueryKey(params),
    queryFn: ({ signal }) => getView1(params, { signal, ...requestOptions }),
    ...queryOptions,
  } satisfies UseQueryOptions<GetView1Response, ErrorType<unknown>>;
};

export function useGetView1(
  params: View1Params,
  options?: {
    query?: Partial<UseQueryOptions<GetView1Response, ErrorType<unknown>>>;
    request?: SecondParameter<typeof orvalApiClient>;
  },
) {
  return useQuery(getView1QueryOptions(params, options));
}
