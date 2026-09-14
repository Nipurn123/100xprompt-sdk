/**
 * 06 - Models, Providers & Configuration
 * 
 * Demonstrates:
 * 1. Querying supported AI providers (Anthropic, OpenAI, Google, DeepSeek, GLM, etc.) and model catalogs.
 * 2. Inspecting current live configuration (`client.config.get`).
 * 3. Updating agent settings and parameters dynamically (`client.config.update`).
 * 
 * Run with: bun run example/06-models-and-providers.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"

async function main() {
  const { client, server } = await create100XPrompt()

  try {
    // 1. List available AI providers and model catalogs
    console.log("🤖 Querying AI Providers & Models...")
    const providers = await client.provider.list()
    
    console.log(`Available Providers: ${providers.data.all?.length ?? 0}`)
    for (const p of providers.data.all || []) {
      console.log(`- Provider: ${p.id} (${p.name || p.id})`)
      const modelKeys = Object.keys(p.models || {})
      if (modelKeys.length > 0) {
        console.log(`  Models (${modelKeys.length}): ${modelKeys.slice(0, 5).join(", ")}${modelKeys.length > 5 ? "..." : ""}`)
      }
    }

    // 2. Query current live agent configuration
    console.log("\n⚙️ Fetching current configuration...")
    const configRes = await client.config.get()
    console.log("Current Model:", configRes.data?.model || "default")
    console.log("Theme:", configRes.data?.theme || "default")

    // 3. Update configuration dynamically
    console.log("\n🔧 Updating agent configuration...")
    await client.config.update({
      config: {
        model: "claude-3-7-sonnet",
      },
    })
    console.log("✅ Configuration successfully updated.")

  } finally {
    server.close()
  }
}

main()
