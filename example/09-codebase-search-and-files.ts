/**
 * 09 - Workspace Codebase Search, Symbols & Files
 * 
 * Demonstrates:
 * 1. Performing full-text ripgrep searches across the codebase (`client.find.text`).
 * 2. Finding files by glob / pattern (`client.find.files`).
 * 3. Searching AST code symbols across languages (`client.find.symbols`).
 * 4. Reading file contents through the API (`client.file.read`).
 * 5. Checking Language Server Protocol (LSP) and formatter statuses (`client.lsp.status`, `client.formatter.status`).
 * 
 * Run with: bun run example/09-codebase-search-and-files.ts
 */

import { create100XPrompt } from "@100xprompt/sdk"

async function main() {
  const { client, server } = await create100XPrompt()

  try {
    // 1. Full-text regex search in workspace
    console.log("🔍 Searching codebase for pattern 'create100XPrompt'...")
    const textMatches = await client.find.text({
      pattern: "create100XPrompt",
    })
    console.log(`Found ${textMatches.data.length} occurrences.`)
    for (const match of textMatches.data.slice(0, 3)) {
      console.log(`- ${match.path?.text}:${match.line_number} -> ${match.lines?.text?.slice(0, 80).trim()}`)
    }

    // 2. Finding files matching a pattern
    console.log("\n📁 Finding files matching '*.json'...")
    const files = await client.find.files({
      query: "package.json",
    })
    console.log(`Found files:`, files.data.slice(0, 5))

    // 3. Finding code symbols (classes, functions, interfaces)
    console.log("\n🧬 Finding code symbols matching 'Client'...")
    const symbols = await client.find.symbols({
      query: "Client",
    })
    console.log(`Found ${symbols.data.length} symbols.`)
    for (const sym of symbols.data.slice(0, 5)) {
      console.log(`- [${sym.kind}] ${sym.name} in ${sym.location?.uri}`)
    }

    // 4. Reading file contents directly
    console.log("\n📄 Reading package.json content via API...")
    const fileContent = await client.file.read({
      path: "package.json",
    })
    console.log(`File read successfully, size: ${fileContent.data.content?.length || 0} characters`)

    // 5. Checking LSP & Formatter readiness
    console.log("\n🩺 Checking LSP and Formatter statuses...")
    const lspStatus = await client.lsp.status()
    const formatterStatus = await client.formatter.status()
    console.log(`LSP Status:`, lspStatus.data)
    console.log(`Formatter Status:`, formatterStatus.data)

  } finally {
    server.close()
  }
}

main()
