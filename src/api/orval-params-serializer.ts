/**
 * Custom orval `paramsSerializer` (wired in orval.config.ts) — replaces
 * orval's default per-key `String(value)` query serialization, which sends
 * object-shaped params (e.g. `pageable: { page, size }`) as the literal
 * string "[object Object]". The backend's OpenAPI spec documents `Pageable`
 * as one grouped query param named "pageable", but Spring's actual
 * `PageableHandlerMethodArgumentResolver` only binds it from flat top-level
 * `page`/`size`/`sort` — confirmed against the live API, since an unbound
 * Pageable silently falls back to server defaults instead of erroring.
 * This flattens any object-valued param's keys to the top level so they
 * reach the wire in the shape Spring actually expects.
 */
function append(search: URLSearchParams, key: string, value: unknown) {
  if (value === undefined) return;
  if (Array.isArray(value)) {
    for (const item of value) append(search, key, item);
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      append(search, nestedKey, nestedValue);
    }
    return;
  }
  search.append(key, value === null ? "null" : String(value));
}

export function orvalParamsSerializer(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    append(search, key, value);
  }
  return search.toString();
}
