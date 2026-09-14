/**
 * 01 - Basic Prompt Example
 * 
 * Demonstrates:
 * 1. Spawning a local 100XPrompt server daemon automatically.
 * 2. Creating a new coding session.
 * 3. Sending a prompt to the AI agent.
 * 4. Reading the response.
 * 5. Gracefully shutting down the server process.
 * 
 * Run with: bun run example/01-basic-prompt.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"

async function main() {
  console.log("🚀 Starting 100XPrompt server...")
  
  // create100XPrompt spawns `100xprompt serve` on 127.0.0.1:4096 and returns a typed client
  const { client, server } = await create100XPrompt()
  console.log(`✅ Server listening at: ${server.url}`)

  try {
    // 1. Create a session in the current directory
    console.log("\n📦 Creating session...")
    const session = await client.session.create({
      directory: process.cwd(),
      title: "SDK Basic Prompt Demo",
    })

    const sessionID = session.data.id
    console.log(`✅ Session created with ID: ${sessionID}`)

    // 2. Send a prompt to the AI agent
    console.log("\n💬 Sending prompt to agent...")
    const result = await client.session.prompt({
      sessionID,
      parts: [
        {
          type: "text",
          text: "What programming languages and frameworks are used in this project? Keep it to 2 concise sentences.",
        },
      ],
    })

    console.log("\n🤖 Agent Response:")
    console.log(JSON.stringify(result.data, null, 2))

  } catch (error) {
    console.error("❌ Error occurred:", error)
  } finally {
    // 3. Always shut down the spawned server daemon when finished
    console.log("\n🛑 Stopping server...")
    server.close()
    console.log("✅ Done.")
  }
}

main()
