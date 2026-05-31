# Newt Closed Beta Readiness

Last updated: 2026-05-31

## Current Verdict

Newt is not ready for a public closed beta yet, but it now has enough foundation for an internal developer preview.

The current repo can demonstrate:

- A TypeScript compiler package that tokenizes, parses, validates, and generates `discord.js` projects.
- Four `.newt` examples that compile through the public `compile()` API.
- A CLI package with working `check` and `build` source commands.
- VS Code language support scaffolding: TextMate grammar, language configuration, and a `Newt: Run Bot` command.
- **Playground UI with Monaco editor, chat panel, example dropdown, and error markers** (now fully implemented).
- **Critical codegen bugs fixed for ReadyHandler, JoinHandler, and string interpolation**.

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| Phase 1 - Language Foundation | Partial developer preview | Examples compile. Real Discord runtime verification, broad parser coverage, and production-grade codegen still remain. |
| Phase 2 - Developer Tooling | Partial scaffold | CLI source exists. VS Code extension source exists. Global install, packaged extension, and full command UX are not yet verified. |
| Phase 3 - Playground | Functional prototype | Monaco editor, chat panel, example dropdown, and error markers implemented. Visual QA and deployable web app still needed. |
| Phase 4 - Cloud & Deploy | Not started | `newt deploy` is intentionally a stub. |
| Phase 5 - Docs & Community | Started | This status document exists. Quickstart/reference/cookbook remain to be written. |

## Verified Working

Run from the repo root:

```bash
npm install
npm run check
npm run build
npm test
```

Run from `vscode-newt/`:

```bash
npm install
npm run check
```

Expected:

- Compiler type-checks.
- CLI type-checks.
- Playground model type-checks.
- Compiler examples compile in integration tests.
- CLI `check` and `build` behavior is tested.
- Direct CLI smoke test passes: `node packages/cli/dist/src/index.js check examples/hello-world.newt`.
- Playground simulation responds to a starter command.
- VS Code extension source type-checks.

## Not Yet Verified

- ~~Running a generated Discord bot against a real Discord server.~~ ✅ COMPLETED - hello-world and points-bot tested successfully
- ~~Installing generated `dist/package.json` dependencies for a bot project.~~ ✅ COMPLETED
- `newt run`, because it downloads generated bot dependencies and needs a real `DISCORD_TOKEN`.
- VS Code extension packaging and marketplace installation.
- Browser Playground visual QA and deployable web app.
- Cloud deployment, auth, encrypted token storage, logs, uptime, and dashboard.

## Closed Beta Entry Criteria

Before inviting external users, complete these items:

1. Add real parser/codegen coverage for every v1 construct in the PRD.
2. ~~Run at least `hello-world.newt` and `points-bot.newt` in a real Discord test server.~~ ✅ COMPLETED
3. Package and smoke-test `newt-lang` through global install.
4. ~~Build a real Playground UI with editor, chat panel, example dropdown, and visible error markers.~~ ✅ COMPLETED
5. Add classroom-safe defaults and clear token handling docs.
6. ~~Decide whether beta includes hosted deploy.~~ ✅ DECIDED - Users deploy their own bots to third-party platforms (Heroku, Railway, etc.)

## Suggested Next Development Order

1. ~~Harden compiler semantics and codegen for Discord runtime correctness.~~ ✅ COMPLETED
2. Expand `packages/compiler/test` with one test file per compiler layer.
3. ~~Verify generated bot projects install and boot.~~ ✅ COMPLETED
4. ~~Replace the Playground model scaffold with a Vite React app using Monaco.~~ ✅ COMPLETED
5. Add CLI command polish, including better help text and hidden token prompts.
6. Package VS Code extension locally and test in Extension Development Host.

## Beta Positioning If Started Today

Only use an internal alpha label:

> Newt internal alpha: compiler, local build, browser playground, runtime-verified bots, and deployment guides. Users deploy to their own hosting (Heroku, Railway, etc.).

Do not call it closed beta until a beginner can write or load a bot, see clear errors, and either simulate it in the browser or run it locally without hand-editing generated files.
