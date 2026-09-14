/**
 * 02 - File and Context Example
 * 
 * Demonstrates:
 * 1. Attaching file references (`type: "file"`) into the prompt.
 * 2. Multi-turn conversations (asking follow-up questions in the same session).
 * 3. Inspecting message history across turns.
 * 
 * Run with: bun run example/02-file-and-context.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"
import path from "path"

async function main() {
  const { client, server } = await create100XPrompt()

  try {
    const session = await client.session.create({
      directory: process.cwd(),
      title: "File Context & Multi-turn Session",
    })
    const sessionID = session.data.id
    console.log(`✅ Session created: ${sessionID}`)

    const targetFile = path.resolve(process.cwd(), "package.json")

    // Turn 1: Send a prompt referencing a specific file
    console.log("\n--- Turn 1: Asking agent to inspect package.json ---")
    await client.session.prompt({
      sessionID,
      parts: [
        {
          type: "file",
          mime: "application/json",
          url: `file://${targetFile}`,
        },
        {
          type: "text",
          text: "Summarize the primary purpose and scripts declared in this package.json file.",
        },
      ],
    })

    // Turn 2: Follow-up question in the same ongoing session
    console.log("\n--- Turn 2: Follow-up question in same session ---")
    await client.session.prompt({
      sessionID,
      parts: [
        {
          type: "text",
          text: "Based on those scripts, what command should I run to build the project?",
        },
      ],
    })

    // Inspect the complete session message history
    console.log("\n--- Fetching full conversation history ---")
    const messages = await client.session.messages({ sessionID })
    console.log(`Total messages in history: ${messages.data.length}`)
    for (const msg of messages.data) {
      console.log(`- [${msg.role}]: ${msg.parts?.map((p: any) => p.text || p.type).join(" ")?.slice(0, 80)}...`)
    }

  } finally {
    server.close()
  }
}

main()
