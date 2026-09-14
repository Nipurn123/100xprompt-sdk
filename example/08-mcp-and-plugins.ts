/**
 * 08 - Model Context Protocol (MCP) & Plugins
 * 
 * Demonstrates:
 * 1. Querying MCP servers and their connection statuses (`client.mcp.status`).
 * 2. Connecting new local or remote MCP servers (`client.mcp.add`).
 * 3. Discovering, installing, and managing plugins from marketplaces (`client.plugin.*`).
 * 
 * Run with: bun run example/08-mcp-and-plugins.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"

async function main() {
  const { client, server } = await create100XPrompt()

  try {
    // 1. Inspect configured MCP servers
    console.log("🔌 Inspecting MCP Server statuses...")
    const mcpStatus = await client.mcp.status()
    console.log("Configured MCP Servers:", mcpStatus.data)

    // Example of registering a local MCP server (e.g. SQLite, GitHub, Filesystem MCP):
    /*
    await client.mcp.add({
      name: "sqlite-mcp",
      config: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-sqlite", "./test.db"],
        type: "local",
      },
    })
    */

    // 2. Discover available plugins from configured marketplaces
    console.log("\n🧩 Discovering plugins...")
    const plugins = await client.plugin.discover()
    console.log(`Discovered plugins: ${plugins.data.length}`)
    for (const plug of plugins.data.slice(0, 5)) {
      console.log(`- Plugin: ${plug.name} — ${plug.description || "No description"}`)
    }

    // 3. Inspect installed plugins
    console.log("\n📦 Listing installed plugins...")
    const installed = await client.plugin.installed()
    console.log(`Installed plugins count: ${installed.data.length}`)

    // 4. Inspect active marketplaces
    console.log("\n🏪 Listing marketplaces...")
    const marketplaces = await client.plugin.marketplaces()
    console.log("Marketplaces:", marketplaces.data)

  } finally {
    server.close()
  }
}

main()
