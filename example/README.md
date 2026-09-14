# 100XPrompt SDK Examples

This directory contains complete, working TypeScript examples demonstrating every capability of the **@100xprompt/sdk**.

## Prerequisites
Ensure the `100xprompt` CLI is installed and available on your PATH:
```bash
curl -fsSL https://100xprompt.com/install | bash
```

## Running the Examples
You can run any example directly with [Bun](https://bun.sh) or [Node.js](https://nodejs.org) (v18+ with tsx):

```bash
bun run example/01-basic-prompt.ts
```

---

## Index of Examples

| File | What it Demonstrates |
| :--- | :--- |
| **[`01-basic-prompt.ts`](./01-basic-prompt.ts)** | Spawning a local server, creating a session, sending a prompt, receiving the agent's response, and clean shutdown. |
| **[`02-file-and-context.ts`](./02-file-and-context.ts)** | Attaching files and code context into prompts, multi-turn conversations, and fetching complete message history. |
| **[`03-streaming-events.ts`](./03-streaming-events.ts)** | Real-time Server-Sent Events (SSE) streaming (`client.event.subscribe`), live tool execution updates, turns, and progress tracking. |
| **[`04-session-management.ts`](./04-session-management.ts)** | Session lifecycle: listing, inspecting git diffs (`session.diff`), forking timelines (`session.fork`), revert dry-runs (`revert.preview`), and deletion. |
| **[`05-interactive-permissions-and-questions.ts`](./05-interactive-permissions-and-questions.ts)** | Handling tool permission requests (`permission.reply`) and answering interactive user questions asked by the agent (`question.reply`). |
| **[`06-models-and-providers.ts`](./06-models-and-providers.ts)** | Querying AI models and providers, managing credentials, and updating agent configuration dynamically (`config.update`). |
| **[`07-terminal-and-pty.ts`](./07-terminal-and-pty.ts)** | Managing isolated pseudo-terminals (`pty.create`, `pty.list`, `pty.remove`) for running commands and shell processes. |
| **[`08-mcp-and-plugins.ts`](./08-mcp-and-plugins.ts)** | Connecting Model Context Protocol (MCP) servers and discovering, installing, and managing plugins from marketplaces. |
| **[`09-codebase-search-and-files.ts`](./09-codebase-search-and-files.ts)** | Workspace tools: full-text search (`find.text`), symbol search (`find.symbols`), file matching (`find.files`), reading files, and checking LSP/formatters. |
| **[`10-connect-existing-server.ts`](./10-connect-existing-server.ts)** | Connecting the client to an already-running local or remote server instance (custom URL, auth tokens, diagnostic handlers) without spawning a process. |
