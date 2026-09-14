/**
 * 05 - Interactive Permissions & Questions
 * 
 * Demonstrates:
 * 1. Handling agent consent/permission requests (approving or denying commands/tools).
 * 2. Answering interactive multiple-choice questions or write-ins prompted by the agent.
 * 3. Building an autonomous consent handler or interactive prompt bridge.
 * 
 * Run with: bun run example/05-interactive-permissions-and-questions.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"

async function main() {
  const { client, server } = await create100XPrompt()

  try {
    const session = await client.session.create({
      directory: process.cwd(),
      title: "Interactive Permissions & Questions Demo",
    })
    const sessionID = session.data.id

    // 1. Inspect any pending permission requests
    console.log("🔒 Checking for pending tool permission requests...")
    const permissions = await client.permission.list()
    console.log(`Pending permission requests: ${permissions.data.length}`)

    for (const perm of permissions.data) {
      console.log(`Permission requested for "${perm.permission}":`, perm.patterns)
      
      // Auto-approve or deny based on your security policy:
      // await client.permission.reply({
      //   id: perm.id,
      //   response: "allow", // or "deny"
      // })
    }

    // 2. Inspect any pending interactive user questions from the agent
    console.log("\n❓ Checking for pending interactive questions from agent...")
    const questions = await client.question.list()
    console.log(`Pending question batches: ${questions.data.length}`)

    for (const q of questions.data) {
      console.log(`Question Batch ID: ${q.id}`)
      for (const item of q.questions) {
        console.log(`- Question: ${item.text}`)
        console.log(`  Options:`, item.options)
      }

      // Answering the question programmatically:
      // await client.question.reply({
      //   id: q.id,
      //   answers: [q.questions[0]?.options?.[0]?.label || "Yes, proceed with Recommended"],
      // })
    }

    console.log("\n✅ Permission & question inspection complete.")

  } finally {
    server.close()
  }
}

main()
