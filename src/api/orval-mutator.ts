import type { Options } from "ky";
import { apiClient } from "@/api/api-client";

type PrimitiveBody = BodyInit;

type OrvalRequestConfig = {
  url: string;
  method?: Options["method"];
  params?: Options["searchParams"];
  data?: unknown;
  body?: unknown;
  headers?: Options["headers"];
  signal?: AbortSignal | null;
};

const isPrimitiveBody = (value: unknown): value is PrimitiveBody =>
  value instanceof Blob ||
  value instanceof FormData ||
  value instanceof URLSearchParams ||
  typeof value === "string" ||
  value instanceof ArrayBuffer ||
  ArrayBuffer.isView(value);

export async function orvalApiClient<T>(
  url: string,
  {
    method,
    params,
    data,
    body,
    headers,
    signal,
  }: Omit<OrvalRequestConfig, "url">,
): Promise<T> {
  const payload = body ?? data;

  return apiClient(url, {
    method,
    searchParams: params,
    headers,
    signal,
    ...(payload === undefined
      ? {}
      : isPrimitiveBody(payload)
        ? { body: payload }
        : { json: payload }),
  }).json<T>();
}

export type ErrorType<Error> = Error;
export type BodyType<BodyData> = BodyData;
