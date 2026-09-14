#!/usr/bin/env bun

import { $ } from "bun"

const dir = new URL("..", import.meta.url).pathname
process.chdir(dir)

await import("./build")

// Clean old tarballs
await $`rm -f *.tgz`.nothrow()

// Pack and publish to npm with public access
await $`bun pm pack`
await $`npm publish *.tgz --access public`

console.log("Published @100xprompt/sdk to npm successfully!")
