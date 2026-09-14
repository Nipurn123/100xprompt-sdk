export * from "./gen/types.gen.js";
import { createClient } from "./gen/client/client.gen.js";
import { X100PromptClient as _X100PromptClient } from "./gen/sdk.gen.js";
export { _X100PromptClient as X100PromptClient };
let defaultDiagnosticHandler;
/**
 * Install the process-wide sink for client diagnostics, for hosts that build
 * clients in several places (the CLI wires this to its file logger once at
 * startup). Per-client `onDiagnostic` wins over it.
 *
 * With no handler installed the diagnostic is DROPPED. That is deliberate: a
 * library writing to stdio behind the host's back is the bug this replaced.
 */
export function set100XPromptClientDiagnosticHandler(handler) {
    defaultDiagnosticHandler = handler;
}
export function create100XPromptClient(config) {
    const originalFetch = config?.fetch ?? globalThis.fetch;
    const onDiagnostic = config?.onDiagnostic;
    const report = (diagnostic) => {
        const handler = onDiagnostic ?? defaultDiagnosticHandler;
        if (!handler)
            return;
        try {
            handler(diagnostic);
        }
        catch {
            // A broken sink must never take down the request it was describing.
        }
    };
    const customFetch = async (request) => {
        // HeyAPI passes a Request object
        let signal = request.signal;
        // @ts-ignore - Bun specific timeout extension
        request.timeout = false;
        // Captured before the call: `response.url` is empty whenever the Response
        // was constructed by hand instead of coming off the wire, which is exactly
        // the case in the TUI (its `fetch` is a postMessage bridge to the server
        // worker). The Request always knows where it was going.
        const requestUrl = request.url;
        const response = await originalFetch(request);
        const wrapParser = (parser, parseType) => {
            return async () => {
                try {
                    return await parser();
                }
                catch (e) {
                    if (e instanceof Error &&
                        (e.message.includes("Unexpected end of JSON input") ||
                            e.message.includes("terminated") ||
                            e.message.includes("JSON"))) {
                        // Case 1: Request was intentionally aborted — surface a clean AbortError
                        if (signal?.aborted) {
                            const abortError = new Error("The operation was aborted");
                            abortError.name = "AbortError";
                            throw abortError;
                        }
                        // Case 2: Server returned empty/truncated body on a success response
                        // Return safe defaults instead of crashing
                        if (response.ok) {
                            const parseAs = parseType === "text" ? "text" : "json";
                            report({
                                kind: "empty-response-body",
                                message: `empty or malformed response body from ${requestUrl} (status ${response.status}); ` +
                                    `returning empty ${parseAs === "text" ? "string" : "object"}`,
                                url: requestUrl,
                                status: response.status,
                                parseAs,
                                cause: e,
                            });
                            return parseAs === "text" ? "" : {};
                        }
                        // Case 3: Error response with unparseable body — wrap with context
                        const wrappedError = new Error(`Failed to parse ${parseType ?? "response"} from ${requestUrl} (status ${response.status}): ${e.message}`);
                        wrappedError.name = "ResponseParseError";
                        throw wrappedError;
                    }
                    throw e;
                }
            };
        };
        // Proxy the response to wrap json() and text()
        return new Proxy(response, {
            get(target, prop) {
                // Keep the endpoint visible downstream too, so anything reading
                // `response.url` off a bridged response sees the real target instead
                // of the empty string a hand-built Response reports.
                if (prop === "url" && !target.url)
                    return requestUrl;
                const value = target[prop];
                if (typeof value === "function") {
                    if (prop === "json" || prop === "text") {
                        return wrapParser(value.bind(target), prop);
                    }
                    return value.bind(target);
                }
                return value;
            },
        });
    };
    config = {
        ...config,
        fetch: customFetch,
    };
    if (config?.directory) {
        // HTTP headers are ISO-8859-1; a non-ASCII path (CJK, Cyrillic, accents)
        // would otherwise throw or arrive corrupted.
        const isNonASCII = /[^\x00-\x7F]/.test(config.directory);
        const encodedDirectory = isNonASCII ? encodeURIComponent(config.directory) : config.directory;
        config.headers = {
            ...config.headers,
            "x-100xprompt-directory": encodedDirectory,
        };
    }
    const client = createClient(config);
    return new _X100PromptClient({ client });
}
