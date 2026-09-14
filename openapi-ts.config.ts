import path from "path"
import { defineConfig } from "@hey-api/openapi-ts"

const dir = new URL(".", import.meta.url).pathname

/**
 * Generates `src/gen` from the OpenAPI spec at `packages/sdk/openapi.json`.
 *
 * Run via `script/generate.ts`, which regenerates the spec from the live Zod
 * schemas *first* — these types are only as fresh as the spec they are built
 * from. This is the only generated tree.
 *
 * The options below are load-bearing for the published SDK surface, not
 * defaults: `instance` fixes the root class name (`X100PromptClient`), and
 * `exportFromIndex: false` keeps the barrel file out of `src/gen`, since
 * `src/client.ts` re-exports the generated modules by hand.
 */
export default defineConfig({
  input: path.join(dir, "../openapi.json"),
  output: {
    path: path.join(dir, "src/gen"),
    tsConfigPath: path.join(dir, "tsconfig.json"),
    clean: true,
  },
  plugins: [
    {
      name: "@hey-api/typescript",
      exportFromIndex: false,
    },
    {
      name: "@hey-api/sdk",
      instance: "X100PromptClient",
      exportFromIndex: false,
      auth: false,
      paramsStructure: "flat",
    },
    {
      name: "@hey-api/client-fetch",
      exportFromIndex: false,
      baseUrl: "http://localhost:4096",
    },
  ],
})
