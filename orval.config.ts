import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "orval";

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
      filters: {
        mode: "exclude",
        tags: ["Debate WebSocket"],
      },
    },
    output: {
      target: "./.orval-staging/endpoints.ts",
      schemas: "./.orval-staging/model",
      client: "react-query",
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
