#!/usr/bin/env bun

const dir = new URL("..", import.meta.url).pathname
process.chdir(dir)

import { $ } from "bun"

// There is ONE generated client, at src/gen, produced by openapi-ts (see
// openapi-ts.config.ts, invoked from script/generate.ts).
//
// This used to also mirror src/gen into src/v2/gen. `/v2` was introduced when
// the generated call signature moved from nested (`{ path: { id } }`) to flat
// (`{ id }`), which could not be changed in place on a published package. That
// migration is finished — src/gen is generated flat — so the second tree was an
// identical copy, and both it and the `/v2` export have been removed.

await $`rm -rf dist`
await $`bun tsc`
