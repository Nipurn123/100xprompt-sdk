export * from "./gen/types.gen.js"

import { createClient } from "./gen/client/client.gen.js"
import { type Config } from "./gen/client/types.gen.js"
import { X100PromptClient as _X100PromptClient } from "./gen/sdk.gen.js"
export { type Config as X100PromptClientConfig, _X100PromptClient as X100PromptClient }

/**
 * A non-fatal condition the client recovered from. Reported through a hook
 * rather than the console: this is a library, and the host may own the
 * terminal — the TUI renders into it, so a stray `console.warn` is drawn
 * straight into the frame and corrupts it.
 */
export interface X100PromptClientDiagnostic {
  /** A 2xx response whose body was empty or truncated; a default was returned. */
  kind: "empty-response-body"
  /** Human-readable, already formatted for a log line. */
  message: string
  /** The request URL. Taken from the Request, not the Response: a
   *  hand-constructed Response (the TUI's worker-thread fetch bridge builds
   *  one) always has `url === ""`. */
  url: string
  status: number
  /** What the caller asked the body to be parsed as. */
  parseAs: "json" | "text"
  /** The underlying parse failure. */
  cause: Error
}

export type X100PromptClientDiagnosticHandler = (diagnostic: X100PromptClientDiagnostic) => void

let defaultDiagnosticHandler: X100PromptClientDiagnosticHandler | undefined

/**
 * Install the process-wide sink for client diagnostics, for hosts that build
 * clients in several places (the CLI wires this to its file logger once at
 * startup). Per-client `onDiagnostic` wins over it.
 *
 * With no handler installed the diagnostic is DROPPED. That is deliberate: a
 * library writing to stdio behind the host's back is the bug this replaced.
 */
export function set100XPromptClientDiagnosticHandler(handler: X100PromptClientDiagnosticHandler | undefined) {
  defaultDiagnosticHandler = handler
}

export type X100PromptClientOptions = Config & {
  directory?: string
  /** Per-client diagnostic sink; overrides the process-wide handler. */
  onDiagnostic?: X100PromptClientDiagnosticHandler
}

export function create100XPromptClient(config?: X100PromptClientOptions) {
  const originalFetch = config?.fetch ?? globalThis.fetch
  const onDiagnostic = config?.onDiagnostic

  const report = (diagnostic: X100PromptClientDiagnostic) => {
    const handler = onDiagnostic ?? defaultDiagnosticHandler
    if (!handler) return
    try {
      handler(diagnostic)
    } catch {
      // A broken sink must never take down the request it was describing.
    }
  }

  const customFetch = async (request: Request): Promise<Response> => {
    // HeyAPI passes a Request object
    let signal: AbortSignal | undefined = request.signal
    // @ts-ignore - Bun specific timeout extension
    request.timeout = false

    // Captured before the call: `response.url` is empty whenever the Response
    // was constructed by hand instead of coming off the wire, which is exactly
    // the case in the TUI (its `fetch` is a postMessage bridge to the server
    // worker). The Request always knows where it was going.
    const requestUrl = request.url

    const response = await originalFetch(request)

    const wrapParser = (parser: () => Promise<any>, parseType?: string) => {
      return async () => {
        try {
          return await parser()
        } catch (e) {
          if (
            e instanceof Error &&
            (e.message.includes("Unexpected end of JSON input") ||
              e.message.includes("terminated") ||
              e.message.includes("JSON"))
          ) {
            // Case 1: Request was intentionally aborted — surface a clean AbortError
            if (signal?.aborted) {
              const abortError = new Error("The operation was aborted")
              abortError.name = "AbortError"
              throw abortError
            }

            // Case 2: Server returned empty/truncated body on a success response
            // Return safe defaults instead of crashing
            if (response.ok) {
              const parseAs = parseType === "text" ? "text" : "json"
              report({
                kind: "empty-response-body",
                message:
                  `empty or malformed response body from ${requestUrl} (status ${response.status}); ` +
                  `returning empty ${parseAs === "text" ? "string" : "object"}`,
                url: requestUrl,
                status: response.status,
                parseAs,
                cause: e,
              })
              return parseAs === "text" ? "" : {}
            }

            // Case 3: Error response with unparseable body — wrap with context
            const wrappedError = new Error(
              `Failed to parse ${parseType ?? "response"} from ${requestUrl} (status ${response.status}): ${e.message}`,
            )
            wrappedError.name = "ResponseParseError"
            throw wrappedError
          }
          throw e
        }
      }
    }

    // Proxy the response to wrap json() and text()
    return new Proxy(response, {
      get(target, prop) {
        // Keep the endpoint visible downstream too, so anything reading
        // `response.url` off a bridged response sees the real target instead
        // of the empty string a hand-built Response reports.
        if (prop === "url" && !target.url) return requestUrl
        const value = target[prop as keyof Response]
        if (typeof value === "function") {
          if (prop === "json" || prop === "text") {
            return wrapParser(value.bind(target) as any, prop as string)
          }
          return value.bind(target)
        }
        return value
      },
    })
  }

  config = {
    ...config,
    fetch: customFetch as any,
  }

  if (config?.directory) {
    // HTTP headers are ISO-8859-1; a non-ASCII path (CJK, Cyrillic, accents)
    // would otherwise throw or arrive corrupted.
    const isNonASCII = /[^\x00-\x7F]/.test(config.directory)
    const encodedDirectory = isNonASCII ? encodeURIComponent(config.directory) : config.directory
    config.headers = {
      ...config.headers,
      "x-100xprompt-directory": encodedDirectory,
    }
  }

  const client = createClient(config)
  return new _X100PromptClient({ client })
}
