/**
 * 04 - Session Lifecycle & Git Management
 * 
 * Demonstrates:
 * 1. Listing all active and archived sessions.
 * 2. Inspecting git diffs produced by an agent in a session (`client.session.diff`).
 * 3. Forking a session into a new branch/timeline (`client.session.fork`).
 * 4. Previewing and reverting agent file changes (`client.revert.preview`).
 * 5. Aborting a running session and deleting sessions.
 * 
 * Run with: bun run example/04-session-management.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"

async function main() {
  const { client, server } = await create100XPrompt()

  try {
    // 1. List all existing sessions
    console.log("📋 Listing existing sessions...")
    const listRes = await client.session.list()
    console.log(`Found ${listRes.data.length} sessions.`)

    // 2. Create a new session
    const session = await client.session.create({
      directory: process.cwd(),
      title: "Lifecycle & Diff Test Session",
    })
    const sessionID = session.data.id
    console.log(`✅ Created session: ${sessionID}`)

    // 3. Inspect session metadata
    const details = await client.session.get({ sessionID })
    console.log(`Session details: Title="${details.data.title}", Directory="${details.data.directory}"`)

    // 4. Check for git diffs produced by this session
    console.log("\n🔍 Checking git diffs for this session...")
    const diff = await client.session.diff({ sessionID })
    console.log("Git diffs:", diff.data || "(No modifications yet)")

    // 5. Fork the session to create an alternate exploration timeline
    console.log("\n🔀 Forking session...")
    const forked = await client.session.fork({
      sessionID,
    })
    console.log(`✅ Forked session ID: ${forked.data.id}`)

    // 6. Preview what a revert would modify (dry-run)
    console.log("\n⏪ Previewing revert status...")
    const revertPreview = await client.revert.preview({
      sessionID,
      mode: "both",
    })
    console.log("Revert preview:", revertPreview.data)

    // 7. Cleanup: Delete the test sessions
    console.log("\n🗑️ Deleting test sessions...")
    await client.session.delete({ sessionID })
    await client.session.delete({ sessionID: forked.data.id })
    console.log("✅ Sessions deleted cleanly.")

  } finally {
    server.close()
  }
}

main()
