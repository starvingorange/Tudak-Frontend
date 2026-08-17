import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  defineConfig,
  defineTransformer,
  type OpenApiOperationObject,
  type OpenApiParameterObject,
  type OpenApiReferenceObject,
} from "orval";

function loadEnvFile(fileName: string) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const HTTP_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const;

function isParameterObject(
  param: OpenApiParameterObject | OpenApiReferenceObject,
): param is OpenApiParameterObject {
  return !("$ref" in param);
}

/**
 * TEMP WORKAROUND: 백엔드 스펙에서 일부 오퍼레이션은 URL에 `{id}` 같은 path
 * parameter가 있는데도 `parameters`에 선언이 안 돼 있어 orval의 스펙 검증이
 * 막힌다 (예: `POST /api/debates/{debateId}`). 같은 경로의 다른 메서드에
 * 이미 선언돼 있으면 그 정의를 복사해서 채워 넣고, 없으면 정수 path param
 * 으로 대체한다. 백엔드가 스펙을 고치면 이 함수와 아래 `override.transformer`
 * 를 통째로 지울 것.
 */
const patchMissingPathParameters = defineTransformer((spec) => {
  for (const [route, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!pathItem) continue;

    const routeParamNames = [...route.matchAll(/\{([^}]+)\}/g)].map(
      (match) => match[1],
    );
    if (routeParamNames.length === 0) continue;

    const operations: [
      (typeof HTTP_METHODS)[number],
      OpenApiOperationObject,
    ][] = [];
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation) operations.push([method, operation]);
    }

    const knownPathParams = operations
      .flatMap(([, operation]) => operation.parameters ?? [])
      .filter(isParameterObject)
      .filter((param) => param.in === "path");

    for (const [method, operation] of operations) {
      const declaredNames = new Set(
        [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]
          .filter(isParameterObject)
          .filter((param) => param.in === "path")
          .map((param) => param.name),
      );

      const missingNames = routeParamNames.filter(
        (name) => !declaredNames.has(name),
      );
      if (missingNames.length === 0) continue;

      operation.parameters = [
        ...(operation.parameters ?? []),
        ...missingNames.map(
          (name) =>
            knownPathParams.find((param) => param.name === name) ?? {
              name,
              in: "path" as const,
              required: true,
              schema: { type: "integer" as const, format: "int64" },
            },
        ),
      ];

      console.warn(
        `[orval] ${method.toUpperCase()} ${route}: 스펙에 없는 path parameter [${missingNames.join(", ")}]를 임시로 채워 넣었습니다 — 백엔드 스펙을 고치면 orval.config.ts의 patchMissingPathParameters를 지우세요.`,
      );
    }
  }

  return spec;
});

const openApiTarget = process.env.ORVAL_OPENAPI_URL ?? "./openapi.json";

if (
  openApiTarget === "./openapi.json" &&
  !existsSync(resolve(process.cwd(), openApiTarget))
) {
  throw new Error(
    "ORVAL_OPENAPI_URL is not set and ./openapi.json does not exist. Add ORVAL_OPENAPI_URL to .env.local or place openapi.json at the project root.",
  );
}

export default defineConfig({
  tudack: {
    input: {
      target: openApiTarget,
      override: {
        transformer: patchMissingPathParameters,
      },
      filters: {
        mode: "exclude",
        tags: ["Debate WebSocket"],
      },
    },
    output: {
      target: "./.orval-staging/endpoints.ts",
      schemas: "./.orval-staging/model",
      client: "fetch",
      mode: "tags-operations-split",
      override: {
        mutator: {
          path: "./src/api/orval-mutator.ts",
          name: "orvalApiClient",
        },
        // `orvalApiClient` (src/api/orval-mutator.ts) resolves to parsed JSON
        // directly (ky's `.json<T>()`), never a `{ data, status, headers }`
        // envelope — match that so generated return types reflect what the
        // mutator actually returns at runtime.
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});
