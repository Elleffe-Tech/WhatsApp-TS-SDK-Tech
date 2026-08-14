# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What this is

`@elleffe-tech/whatsapp` — an unofficial TypeScript SDK for Meta's WhatsApp
Business Platform Cloud API. ESM-only, Node.js >=22, targets Graph API `v25.0`
exclusively (hardcoded via `Client.DEFAULT_GRAPH_VERSION`, no `graphVersion`
option). A fork lineage: original WhatsApp SDK → Great Detail's
`@great-detail/whatsapp` → this repo.

## Commands

Package manager is **pnpm** (see `packageManager` in package.json).

```bash
pnpm install                # install deps
pnpm run build               # tsdown -> dist/ (required before lint:publint / test:package)
pnpm run typecheck           # tsc --noEmit
pnpm run lint                # eslint + prettier check + publint (requires prior build)
pnpm run fix                 # eslint --fix + prettier --write
pnpm run test:unit           # run src/**/*.test.ts with node's test runner (no coverage)
pnpm run test:coverage       # same, with coverage thresholds enforced (98% lines / 80% branches / 95% functions)
pnpm run test:package        # builds a tarball with `pnpm pack` and smoke-tests the packed npm artifact
pnpm test                    # build + test:coverage + test:package (full CI-equivalent suite)
```

Run a single test file directly with the node test runner, e.g.:

```bash
node --import tsx --test ./src/Webhook/index.test.ts
```

Filter to a specific test by name with node's `--test-name-pattern`:

```bash
node --import tsx --test --test-name-pattern="serializes" ./src/Client.methods.test.ts
```

CI (`.github/workflows/release.yml`, runs on every push to `main`) does, in
order: install → build → lint → typecheck → test:coverage → test:package →
changesets release/publish (npm Trusted Publishing/OIDC). `lint:publint`
inspects `dist/`, so the build must run before lint.

Releases are managed with **Changesets** (`pnpm changeset` to add one). Legacy
`tests/bun` and `tests/deno` directories have been removed — Bun/Deno/browser
runtimes are explicitly unsupported.

## Architecture

### Client composition

`src/Client.ts` is a single composition root: it creates one `ky` instance
(`_transport`, based at `graph.facebook.com/v25.0/`) and instantiates one class
per API surface (e.g. `analytics`, `message`, `template`, `phoneNumbers`,
`webhook`, ...), injecting that transport. `Client.Options.request` is raw `ky`
`Options` (minus `prefixUrl`) passed through — retries, hooks, custom `fetch`,
timeout, etc. all flow from there. Every path template passed to `ky` is
**relative and must not start with `/`**, or URL resolution silently drops the
`/v25.0/` segment.

Analytics is the one surface with an unusual shape: `analytics`,
`conversation_analytics` and `pricing_analytics` are Graph **field expansions**
on the WABA node (`?fields=analytics.start(…).end(…).granularity(…)`), while
`template_analytics` is a real **edge**. See `src/Analytics/index.ts`.

### Per-domain module shape

Each top-level domain lives in its own `src/<Domain>/` directory (`Message`,
`Template`, `PhoneNumbers`, `Groups`, `Analytics`, `BillingMigration`,
`BusinessScopedUsers`, `InAppSignup`, `MarketingMessages`, `MessagingAccounts`,
`SubscribedApps`, `WhatsappBusinessAccount`, `Webhook`, `Media`,
`BusinessProfile`, ...), each exporting a default class whose constructor takes
the `KyInstance`(s) it needs. Methods generally:

1. Accept a single options object combining path/query params, request body
   fields, and an optional `request` (per-call `ky` overrides).
2. Build query params (e.g. serializing `fields` arrays, where nested field
   selections use a `[field, subfields[]]` tuple, e.g.
   `["whatsapp_business_profile", [...]]` → `whatsapp_business_profile{...}`).
3. Call `this._transport.extend({...})<PayloadType>(endpoint, request)`,
   returning a `ky` response promise (callers do `.json()` themselves).

Types for each domain live in the mirrored `src/types/<Domain>/index.ts` —
request `Options`, response `Payload` types, and field/enum unions (frequently
`const X = [...] as const; type X = (typeof X)[number]`). `src/index.ts` is the
public entrypoint and re-exports (mostly `export type *`) the full type surface;
adding a new domain means wiring it into `Client.ts` **and** re-exporting its
types from `src/index.ts`.

### Webhooks are handled locally, not via HTTP

`src/Webhook/index.ts` doesn't make requests — it's a pure request/response
transform for consumers' own HTTP servers (Express/Fastify/Oak examples in the
README). Two entrypoints:

- `register()` — handles Meta's `GET` verification handshake (`hub.mode`,
  `hub.verify_token`, `hub.challenge`), returning an object with `.accept()`/
  `.reject()` helpers.
- `eventNotification()` — parses inbound webhook POST bodies into typed
  `WebhookEventNotification` payloads and exposes `.verifySignature(appSecret)`
  (constant-time HMAC comparison via `timingSafeEqual`, supporting both
  `x-hub-signature` (sha1) and `x-hub-signature-256` headers).

Failure modes are distinct error classes under `src/Webhook/WebhookError/`
(`InvalidHubSignatureWebhookError`, `InvalidHubModeWebhookError`, etc.), all
extending a base `WebhookError`.

### Testing conventions

- Tests are colocated as `*.test.ts` next to the code they cover (node's
  built-in test runner + `node:assert/strict`, run through `tsx`).
- `src/test/requestCapture.ts` provides shared test infrastructure:
  `createClient()` builds a `Client` pointed at a fake
  `https://graph.example.test` origin with a mock `fetch` that records every
  outgoing `Request` (url, method, parsed JSON/multipart/text body) into a
  `requests` array — the standard way to assert on what a method actually sent
  over the wire without a real HTTP server.
- `src/Client.methods.test.ts` is a broad "one giant contract test": it drives
  every public client method and asserts the resulting request's pathname,
  method, search params, and body via a local `assertRequest` helper. Adding a
  new domain/method should extend this file's contract coverage.
- `src/v25-contracts.type-test.ts` is a compile-time-only test: it constructs
  every outgoing message variant / union member so a type regression fails
  `pnpm typecheck` even if runtime serialization still happens to work. It is
  not executed, only type-checked.
- `tests/node/package.test.mjs` is the packed-artifact smoke test: it runs
  `pnpm pack`, installs the tarball into a scratch dir, and verifies the
  published `exports`/`dist` shape and that a plain `import` from the built
  package works — this is what `pnpm run test:package` runs.
- Coverage thresholds (98% lines / 80% branches / 95% functions, scoped to
  `src/**/*.ts` excluding `*.test.ts`/`*.type-test.ts`/`src/test/**`) are
  enforced by `pnpm run test:coverage` and gate CI.
