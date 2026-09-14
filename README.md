# @100xprompt/sdk

TypeScript SDK for [100XPrompt](https://100xprompt.com) — the AI coding agent.

[![npm](https://img.shields.io/npm/v/@100xprompt/sdk?style=flat-square)](https://www.npmjs.com/package/@100xprompt/sdk)

---

A fully-typed client for the 100XPrompt agent server, plus helpers to spawn the server or the terminal UI from Node or Bun. Use it to drive sessions, stream responses, manage models/providers and MCP servers, and build your own tools, UIs, bots, and CI integrations on top of 100XPrompt.

> **The SDK is a client.** It talks to a running `100xprompt` instance — it does not bundle the agent runtime or any model access. You need the CLI installed and a model configured for it to do anything.

## Prerequisites

Install the 100XPrompt CLI so the `100xprompt` binary is on your `PATH`:

```bash
curl -fsSL https://100xprompt.com/install | bash
# or
npm i -g 100xprompt-cli@latest
```

## Install

```bash
npm install @100xprompt/sdk
# bun add @100xprompt/sdk · pnpm add @100xprompt/sdk · yarn add @100xprompt/sdk
```

## Quick start

Spin up a server and a client in one call:

```ts
import { create100XPrompt } from "@100xprompt/sdk"

const { client, server } = await create100XPrompt()

const session = await client.session.create()

await client.session.prompt({
  sessionID: session.data.id,
  parts: [{ type: "text", text: "Write unit tests for src/index.ts" }],
})

server.close()
```

`create100XPrompt()` spawns `100xprompt serve` on `127.0.0.1:4096` and returns a typed client pointed at it.

## Server and client separately

```ts
import { create100XPromptServer, create100XPromptClient } from "@100xprompt/sdk"

const server = await create100XPromptServer({ port: 4096 })
const client = create100XPromptClient({ baseUrl: server.url })

// ... use the client ...

server.close()
```

## Connect to an existing server

If a `100xprompt serve` instance is already running — locally or remotely — skip the spawn and point the client at it:

```ts
import { create100XPromptClient } from "@100xprompt/sdk/client"

const client = create100XPromptClient({
  baseUrl: "https://your-host.example.com",
  headers: { Authorization: `Bearer ${process.env.HUNDREDXPROMPT_TOKEN}` },
})
```

> Authentication, rate limiting, and access control are enforced by the **server**, not the SDK. The SDK only formats requests — secure your hosted instance accordingly.

## Launch the terminal UI

```ts
import { create100XPromptTui } from "@100xprompt/sdk"

const tui = create100XPromptTui({ agent: "build" })
// tui.close() to stop
```

## Types

Every request and response type is exported and generated from the server's OpenAPI schema:

```ts
import type { X100PromptClientConfig } from "@100xprompt/sdk"
```

## Requirements

- Node.js 18+ (for global `fetch`) or Bun
- The `100xprompt` CLI on your `PATH` (see [Prerequisites](#prerequisites))

## Documentation

Full docs at [100xprompt.com/docs](https://100xprompt.com/docs).

## License

Proprietary. See [LICENSE](./LICENSE).
