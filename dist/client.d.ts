export * from "./gen/types.gen.js";
import { type Config } from "./gen/client/types.gen.js";
import { X100PromptClient as _X100PromptClient, Revert, Oauth, Resource, Control } from "./gen/sdk.gen.js";
import { type Client } from "./gen/client/index.js";
export declare class X100PromptClient extends _X100PromptClient {
    revert: Revert;
    oauth: Oauth;
    resource: Resource;
    control: Control;
    constructor(args?: {
        client?: Client;
        key?: string;
    });
}
export { type Config as X100PromptClientConfig, Revert, Oauth, Resource, Control };
/**
 * A non-fatal condition the client recovered from. Reported through a hook
 * rather than the console: this is a library, and the host may own the
 * terminal — the TUI renders into it, so a stray `console.warn` is drawn
 * straight into the frame and corrupts it.
 */
export interface X100PromptClientDiagnostic {
    /** A 2xx response whose body was empty or truncated; a default was returned. */
    kind: "empty-response-body";
    /** Human-readable, already formatted for a log line. */
    message: string;
    /** The request URL. Taken from the Request, not the Response: a
     *  hand-constructed Response (the TUI's worker-thread fetch bridge builds
     *  one) always has `url === ""`. */
    url: string;
    status: number;
    /** What the caller asked the body to be parsed as. */
    parseAs: "json" | "text";
    /** The underlying parse failure. */
    cause: Error;
}
export type X100PromptClientDiagnosticHandler = (diagnostic: X100PromptClientDiagnostic) => void;
/**
 * Install the process-wide sink for client diagnostics, for hosts that build
 * clients in several places (the CLI wires this to its file logger once at
 * startup). Per-client `onDiagnostic` wins over it.
 *
 * With no handler installed the diagnostic is DROPPED. That is deliberate: a
 * library writing to stdio behind the host's back is the bug this replaced.
 */
export declare function set100XPromptClientDiagnosticHandler(handler: X100PromptClientDiagnosticHandler | undefined): void;
export type X100PromptClientOptions = Config & {
    directory?: string;
    /** Per-client diagnostic sink; overrides the process-wide handler. */
    onDiagnostic?: X100PromptClientDiagnosticHandler;
};
export declare function create100XPromptClient(config?: X100PromptClientOptions): X100PromptClient;
