import { defineConfig } from "orval";

const openApiTarget = process.env.ORVAL_OPENAPI_URL ?? "./openapi.json";

export default defineConfig({
  tudack: {
    input: openApiTarget,
    output: {
      target: "./src/api/generated/endpoints.ts",
      schemas: "./src/api/generated/model",
      client: "react-query",
      mode: "tags-split",
      override: {
        mutator: {
          path: "./src/api/orval-mutator.ts",
          name: "orvalApiClient",
        },
      },
    },
  },
});
