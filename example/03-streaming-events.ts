/**
 * 03 - Real-Time Streaming Events (SSE)
 * 
 * Demonstrates:
 * 1. Subscribing to the real-time Server-Sent Events (SSE) stream via `client.event.subscribe()`.
 * 2. Listening for live token generation, tool execution, session state changes, and completion.
 * 3. Handling streaming events concurrently while triggering a prompt.
 * 
 * Run with: bun run example/03-streaming-events.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"

async function main() {
  const { client, server } = await create100XPrompt()

  try {
    const session = await client.session.create({
      directory: process.cwd(),
      title: "Realtime Streaming Demo",
    })
    const sessionID = session.data.id

    // 1. Start listening to the event bus in the background
    console.log("📡 Subscribing to live server events...")
    const stream = await client.event.subscribe()

    // Consume the stream asynchronously
    const eventPromise = (async () => {
      for await (const event of stream) {
        // Filter events for our specific session if applicable
        const props = event.properties as any
        if (props?.sessionID && props.sessionID !== sessionID) continue

        switch (event.type) {
          case "session.turn":
            console.log(`\n🔄 [TURN STATE] Status: ${props.status}`)
            break

          case "session.message":
            console.log(`💬 [MESSAGE UPDATE] Role: ${props.role}`)
            break

          case "tool.execute":
            console.log(`🔧 [TOOL RUNNING] Tool: ${props.tool}, Input:`, props.input)
            break

          case "tool.result":
            console.log(`✅ [TOOL RESULT] Tool: ${props.tool}, Exit: ${props.exitCode ?? 0}`)
            break

          case "session.budget.completed":
            console.log(`💰 [BUDGET/COST] Usage completed`)
            break

          default:
            // Other events: config.changed, file.watcher.updated, etc.
            break
        }

        // Break when the turn is done
        if (event.type === "session.turn" && props.status === "completed") {
          break
        }
      }
    })()

    // 2. Trigger the prompt (this will generate events on the stream)
    console.log("\n🚀 Triggering prompt: 'List 3 files in the current folder using the list tool'")
    await client.session.prompt({
      sessionID,
      parts: [
        {
          type: "text",
          text: "List 3 files in the current folder using the list tool.",
        },
      ],
    })

    // Wait for the stream to process completion
    await eventPromise

  } finally {
    server.close()
  }
}

main()
