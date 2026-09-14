/**
 * 10 - Connecting to an Existing or Remote Server
 * 
 * Demonstrates:
 * 1. Connecting the client to an already running `100xprompt serve` instance without spawning a process.
 * 2. Configuring custom base URLs (e.g. remote EC2, Docker container, or Kubernetes service).
 * 3. Adding Authorization bearer tokens and custom headers.
 * 4. Capturing non-fatal client diagnostics and logs.
 * 
 * Run with: bun run example/10-connect-existing-server.ts
 */

import {
  create100XPromptClient,
  set100XPromptClientDiagnosticHandler,
} from "@100xprompt/sdk"

async function main() {
  // 1. Optional: Install a global diagnostic handler to catch truncated or empty bodies safely
  set100XPromptClientDiagnosticHandler((diagnostic) => {
    console.warn(`[SDK Diagnostic - ${diagnostic.kind}]: ${diagnostic.message} (URL: ${diagnostic.url})`)
  })

  // 2. Point client at an existing or remote server URL
  const REMOTE_URL = process.env.HUNDREDXPROMPT_SERVER_URL || "http://127.0.0.1:4096"
  const TOKEN = process.env.HUNDREDXPROMPT_TOKEN || ""

  console.log(`🔌 Connecting to server at: ${REMOTE_URL}`)

  const client = create100XPromptClient({
    baseUrl: REMOTE_URL,
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    directory: process.cwd(), // Default directory context for sessions
  })

  try {
    // 3. Test connectivity by querying server health & active project
    console.log("🩺 Checking server health...")
    const health = await client.global.health()
    console.log("Health response:", health.data)

    // 4. Query current active project context
    const currentProject = await client.project.current()
    console.log("Active Project:", currentProject.data)

    // 5. Query models available on this instance
    const models = await client.provider.list()
    console.log(`Available models on server: ${models.data.all?.length || 0}`)

    console.log("✅ Successfully connected to existing server.")
  } catch (error) {
    console.error("❌ Failed to connect to existing server:", error)
    console.log("\n💡 Make sure you have started a server with:")
    console.log("   100xprompt serve --port 4096")
  }
}

main()
