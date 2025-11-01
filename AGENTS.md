# Project Overview

- Deno-based project with Docker support; keep human-facing docs in `README.md` and use this file for agent directives.
- Work remains agent-agnostic—assume no private credentials are available and prefer reproducible, scripted changes.

## Environment & Tooling

- Use the Deno version pinned in `deno.json`/`.dvmrc`; if absent, default to the latest stable release and record any new pin.
- Prefer `deno task <name>` wrappers defined in `deno.json`. When adding tasks, document them below.
- Remote module fetches should work without certificate overrides; see "CI Certificate Handling" if a sandbox requires exceptions.
- Leverage Docker for parity: `docker compose up --build` (or the project-specific compose command) should produce a working environment after updates.

## Core Commands

- Format: `deno fmt` (run before committing; never skip formatting).
- Lint: `deno lint`.
- Type-check targeted modules: `deno check <path>`; validate any new entrypoints.
- Tests: `deno test` using `describe`/`it` from `jsr:@std/testing/bdd` and assertions from `jsr:@std/expect`.
- Add more task-specific commands here as they emerge (keep this list authoritative for agents).

## Code Style

- Prefer `async`/`await` over `Promise.then()`, `.catch()`, and `.resolve()` for better readability and error handling.
- Never swallow errors or allow rejected promises to remain uncaught. Always propagate errors back to the user via thrown exceptions or rejected promises—never use silent error logging as a substitute for proper error handling.
- Use idiomatic array type syntax: `T[][]` instead of `Array<T[]>`. See [Google TypeScript Style Guide – Arrays](https://google.github.io/styleguide/tsguide.html#arrayt-type).

## CI Certificate Handling

- Local development must not add `--unsafely-ignore-certificate-errors` to default commands.
- When Copilot's MITM sandbox or another CI runner fails certificate verification, scope overrides to the precise hosts involved.
- Example (adjust the host list to match your CI proxy):
  ```yaml
  # Copilot sandbox workflow
  - name: Run Deno tests in CI
    run: deno test --unsafely-ignore-certificate-errors=deno.land
  ```
- This replaces the legacy `.github/copilot-instructions.md`; keep overrides confined to CI scripts and audit the host list regularly.

## Development Workflow

1. Inspect the nearest `AGENTS.md` plus task instructions before editing.
2. Plan edits, prefer small diffs scoped to the feature/fix.
3. Update or add BDD-style tests alongside behavior changes; ensure failures reproduce the issue before fixes.
4. **Before committing and pushing: Run `deno task ok` to validate formatting, linting, tests, and type checking**.
5. For remote dependency updates, capture changelog links and justify in the PR.

## Architecture & Conventions

- Organize source under `src/` or feature-specific folders; share cross-runtime helpers cautiously.
- Use `jsr:` imports for Deno standard libraries.
- Avoid `any` unless unavoidable; prefer explicit interfaces or type aliases.
- Keep runtime permissions strict; request only what the module needs (`--allow-read=...`, etc.).
- Document new environment variables in `.env.example` or deployment manifests, not in this file.

## Data & External Services

- PostgreSQL: provision with Docker using image `postgres:17`; prefer `npm:kysely` + `npm:pg` for data access. Capture migrations in version-controlled scripts.
- Redis: use image `redis:8`; interact via `npm:bullmq` and `npm:ioredis`.
- Telegram bots: import `grammy` from `https://lib.deno.dev/x/grammy@v1/mod.ts`; avoid grammy sessions per project policy.
  - For grammy types, import from `https://lib.deno.dev/x/grammy@v1/types.ts` (never use `deno.land/x/grammy_types`).
  - **Composer chaining:** The `.on()` method returns a chainable Composer. Use `composer.on("filter").lazy(fn)` instead of `composer.on("filter", composer.lazy(fn))` for cleaner code.
- Record credentials securely (never commit secrets); provide mock values for tests.

## Docker & Deployment Notes

- Ensure Docker builds stay reproducible; explicitly install the required Deno version in images.
- Keep health checks and exposed ports synchronized between `Dockerfile`, `docker-compose.yml`, and docs.
- Run containerized smoke tests (`deno test` or app-specific checks) before publishing new images.

## Git & Review Practices

- Branch from `main` using descriptive names (e.g., `feature/<slug>` or `fix/<slug>`).
- Keep commits atomic with conventional prefixes (`feat:`, `fix:`, `test:`, `chore:`...).
- Include evidence (test output, screenshots, or logs) in PRs; reject merges with failing checks.
- Never push secrets; scan diffs for credentials before committing.

## Agent Playbook

- Treat this file as the single source of truth for agents; link out to READMEs or design docs instead of duplicating them.
- Update this document whenever build/test commands or conventions change; keep it under ~150 lines for fast ingestion.
- When instructions conflict, favor explicit task prompts or closer `AGENTS.md` files per discovery hierarchy.

## Maintenance Checklist

- After each significant change, rerun format/lint/tests and update Docker artifacts if relevant.
- Archive deprecated guidance promptly (stale sections confuse automated agents).
- Encourage contributors to reference this file in PR templates to keep agent context current.
