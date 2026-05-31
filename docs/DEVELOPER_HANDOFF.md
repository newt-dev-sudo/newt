# Newt Developer Handoff

Last updated: 2026-05-31

## What This Repository Is

Newt is a beginner-friendly language for writing Discord bots. A user writes `.newt` files that read like plain English, and the compiler turns them into runnable `discord.js` JavaScript.

The product direction is defined by the PRD and roadmap: Newt should eventually include a compiler, CLI, VS Code extension, browser Playground, and optional hosted deploy.

## What Has Been Built

### Monorepo Scaffold

The repo is an npm workspace rooted at:

```text
newt/
```

Workspace packages:

```text
packages/compiler      Compiler core
packages/cli           newt command-line tool
packages/playground    Browser Playground app
```

Non-workspace project:

```text
vscode-newt            VS Code language extension scaffold
```

Shared supporting folders:

```text
examples               Example .newt programs used by tests
docs                   Status, handoff, and product documentation
```

### Compiler

Location:

```text
packages/compiler
```

Implemented files:

```text
src/ast.ts             AST node definitions
src/lexer.ts           Significant-indentation lexer
src/parser.ts          Recursive descent parser
src/errors.ts          Friendly NewtError catalog and formatter
src/validator.ts       Semantic validation pass
src/codegen.ts         discord.js JavaScript generator
src/index.ts           Public compile/tokenize/parse/validate/generate API
```

The public API is:

```ts
import { compile } from "@newt-lang/compiler";

const result = compile(source, "bot.newt");
```

`compile()` returns either:

```ts
{ success: true, botJs, packageJson }
```

or:

```ts
{ success: false, errors }
```

Current compiler coverage is enough to compile the four example files:

```text
examples/hello-world.newt
examples/points-bot.newt
examples/welcome-bot.newt
examples/moderation-bot.newt
```

Important caveat: codegen is still alpha quality. It emits plausible `discord.js` v14 code, but real Discord runtime behavior has not been fully verified.

### CLI

Location:

```text
packages/cli
```

Implemented commands:

```text
newt check <file>              Compile-checks a .newt file
newt build <file> --out <dir>  Writes bot.js and package.json
newt run <file>                Builds to temp dir, installs generated deps, runs bot
newt new [name]                Creates a starter .newt file
newt deploy <file>             Stub that explains deploy is not available yet
```

The CLI intentionally has no heavy command framework dependency yet. `src/index.ts` parses `process.argv` directly so the package stays small while the command surface is still changing.

### VS Code Extension

Location:

```text
vscode-newt
```

Implemented:

```text
syntaxes/newt.tmLanguage.json      Syntax highlighting
language-configuration.json        Comments, brackets, indentation
src/extension.ts                   Newt: Run Bot command and status item
```

It type-checks, but packaging as `.vsix` and testing in VS Code Extension Development Host still need to be done.

### Playground

Location:

```text
packages/playground
```

Implemented so far:

```text
src/examples.ts            Example gallery data
src/simulationEngine.ts    Lightweight fake Discord response engine
src/AppModel.ts            Compile-aware Playground state model
```

The simulation engine currently extracts simple handler/reply/embed behavior from Newt source. It is not yet a full sandbox that executes generated bot JS.

## How To Build And Verify

From the repo root:

```bash
npm install
npm run check
npm run build
npm test
```

Expected result:

- All workspace TypeScript packages type-check.
- Compiler, CLI, and Playground model build.
- Tests pass.

CLI smoke test:

```bash
node packages/cli/dist/src/index.js check examples/hello-world.newt
node packages/cli/dist/src/index.js build examples/hello-world.newt --out .tmp/hello-build
```

VS Code extension check:

```bash
cd vscode-newt
npm install
npm run check
```

## Current Product Readiness

Newt is currently best described as:

```text
internal alpha / developer preview
```

It is not yet a closed beta for beginners.

## What Still Blocks Closed Beta

### 1. Real Discord Runtime Verification

We need to prove generated `bot.js` actually logs into Discord and responds correctly in a test server.

Minimum runtime checklist:

- Build `examples/hello-world.newt`.
- Install generated bot dependencies.
- Start bot with a real `DISCORD_TOKEN`.
- Confirm bot comes online.
- Send `!hello`.
- Confirm bot replies.
- Build `examples/points-bot.newt`.
- Confirm `store`/`load` persists across restart.

This requires a real Discord application, bot token, invited test server, and Message Content Intent enabled.

### 2. Real Browser Playground UI

The current Playground has the model and simulation logic. It still needs the actual user-facing React UI:

- Monaco editor
- Error markers
- Example dropdown
- Simulated Discord chat panel
- Join/reaction controls
- Shareable links
- Visual QA in browser

### 3. Packaged CLI And VS Code Installs

Need to verify:

- `npm pack` for `newt-lang`
- local global install from the `.tgz`
- `newt check`, `newt build`, and `newt new`
- VS Code extension packaged as `.vsix`
- extension loaded in VS Code Extension Development Host

## About Cloud Deploy

Cloud deploy is not required for a local-first closed beta.

It is only required if the beta promise is:

```text
write a bot and have it hosted online without managing a server
```

For an early closed beta, we can skip cloud deploy and position Newt as:

```text
write locally, build locally, run with your own Discord token
```

That is much cheaper and safer for validation. Cloud deploy adds auth, billing decisions, token encryption, container hosting, abuse prevention, logs, uptime monitoring, and incident response. Those are important later, but they are not necessary to validate the language, compiler, CLI, or Playground experience.

## Recommended Next Agent Tasks

1. Harden compiler/codegen against the four example bots until generated JS can run in Discord.
2. Build the real Vite React Playground UI around `AppModel` and `simulationEngine`.
3. Add a runtime verification script that builds an example into `.tmp/`, installs generated deps, and prints exact manual Discord test steps.
4. Package CLI with `npm pack` and test local install.
5. Package VS Code extension with `vsce package` or a local fallback.
6. Update `docs/status/CLOSED_BETA_READINESS.md` after every verification pass.

## Safety Notes For Future Agents

- Do not commit or hardcode Discord bot tokens.
- Prefer `bot token from env "DISCORD_TOKEN"` in every example.
- Do not overwrite unrelated workspace changes outside `newt/`.
- The parent repo currently has unrelated `notipush` changes; keep them separate.
- Use `rg` for searches.
- Use `apply_patch` for manual edits.
