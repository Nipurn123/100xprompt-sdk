/**
 * 07 - Pseudo-Terminal (PTY) & Command Execution
 * 
 * Demonstrates:
 * 1. Spawning isolated background pseudo-terminals (`client.pty.create`).
 * 2. Listing active PTY sessions (`client.pty.list`).
 * 3. Inspecting and terminating terminal processes (`client.pty.remove`).
 * 
 * Run with: bun run example/07-terminal-and-pty.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"

async function main() {
  const { client, server } = await create100XPrompt()

  try {
    console.log("🖥️ Creating a new PTY session...")

    // 1. Create a pseudo-terminal running a shell command or interactive session
    const pty = await client.pty.create({
      command: "echo 'Hello from 100XPrompt PTY!' && pwd",
      cwd: process.cwd(),
      title: "Demo Terminal Session",
    })

    const ptyID = pty.data.id
    console.log(`✅ PTY created with ID: ${ptyID}`)

    // 2. List all active PTY instances
    console.log("\n📋 Listing active PTY instances...")
    const ptyList = await client.pty.list()
    console.log(`Active PTY instances: ${ptyList.data.length}`)
    for (const p of ptyList.data) {
      console.log(`- PTY ID: ${p.id}, Title: ${p.title || "Untitled"}`)
    }

    // 3. Inspect details of our specific PTY
    const ptyInfo = await client.pty.get({ ptyID })
    console.log(`PTY Info: Command="${ptyInfo.data.command}", Status=${ptyInfo.data.status}`)

    // 4. Clean up: Close the PTY process
    console.log("\n🛑 Terminating PTY session...")
    await client.pty.remove({ ptyID })
    console.log("✅ PTY terminated cleanly.")

  } finally {
    server.close()
  }
}

main()
