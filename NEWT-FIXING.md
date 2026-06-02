# Newt Stabilization And Fixing Prompt

You are a senior TypeScript/Node.js engineer working on `newt-dev-sudo/newt`, a beginner-friendly DSL for Discord bots. Your job is to stabilize the repository end to end, fix known logical flaws, align the implementation with the documented language, and add automated tests so future regressions are caught without manually testing everything in Discord.

Do not treat this as a cosmetic cleanup. The main problem is that the docs, examples, AST, lexer, parser, validator, interpreter, code generator, CLI, and VS Code grammar currently describe overlapping but different versions of Newt. Your priority is to establish one truthful, tested language surface.

## Extra Instructions Before Starting

- Do not try to fix every advanced feature at once. First make the stable beginner path reliable: `bot config`, `on command`, `reply`, `say`, `let`, `store/load`, `if/else`, `args`, `target`, embeds, basic slash commands.
- Prefer disabling or marking incomplete advanced features over pretending they work.
- Add tests before large behavior rewrites where practical. At minimum, add failing fixtures that reproduce the drift you are fixing.
- Treat docs as executable promises. If a docs example is stable, it must compile in tests.
- Do not preserve broken behavior just because it exists in the interpreter or codegen. Define expected behavior in tests, then update both backends to match.
- Avoid giant unrelated refactors. Stabilization is the goal.
- Keep changes reviewable by phase if possible:
  1. build/package fixes
  2. test harness
  3. compiler/parser fixes
  4. runtime/codegen alignment
  5. docs cleanup
- For any feature moved to `experimental` or `planned`, update:
  - docs section
  - feature matrix
  - validator behavior if needed
  - tests/skips with clear rationale
- Do not leave generated JS containing `// TODO: FeatureName` for code that passes validation.
- Do not require real Discord credentials for normal tests or CI.
- If adding real Discord tests, gate them behind env vars and make them opt-in only.
- After each phase, run:
  - `npm run check`
  - `npm run build`
  - `npm run test`
- At the end, include a concise status report:
  - commands run
  - stable features verified
  - features marked experimental/planned
  - known remaining limitations

If scope gets too large, choose correctness over breadth. A smaller Newt that honestly works is better than a larger Newt where half the examples fail.

## Core Principles

- Make the repo build from a fresh checkout.
- Prefer a smaller stable feature set over a large partially working one.
- Do not silently leave TODO-generated code for documented features.
- Do not make `newt check`, `newt run`, and `newt build` disagree for stable syntax.
- Every documented example should be executable as a test fixture.
- Beginner-facing errors should explain what went wrong in Newt terms, not just Discord.js terms.
- Avoid broad refactors unless they remove real implementation drift.
- Preserve public syntax where it is clearly intended and fix implementation to match it. If a feature is not ready, mark it experimental or remove it from stable docs.

## Initial Setup And Baseline

1. Clone the repo and install dependencies from a clean checkout.
2. Run:

```bash
npm install
npm run check
npm run build
npm run test
```

3. Record the initial failures.
4. Add or repair CI scripts so the following can run consistently:

```bash
npm run check
npm run build
npm run test
```

## Phase 1: Make The Monorepo Build

Fix packaging and workspace issues first.

Known issues to address:

- `@newt-dev/cli` imports `@newt-dev/compiler` but does not declare it as a dependency.
- Root workspace order/build ordering is fragile.
- Root `verify:runtime` points to `scripts/verify-generated-bot.mjs`, but the script is missing.
- Root `engines.node` says `>=20`, while CLI runtime check and docs say Node 18+.
- Docs and VS Code extension are outside the root workspaces; decide whether root CI should include them or explicitly document/build them separately.
- Avoid publishing or committing generated release artifacts such as `.vsix` unless there is a deliberate release-artifact policy.

Acceptance criteria:

- Fresh checkout can run `npm install`.
- `npm run check` passes.
- `npm run build` passes.
- Any intentionally excluded package, such as docs or VS Code extension, is documented.

## Phase 2: Establish The Stable Language Surface

Create a feature matrix at `docs/FEATURE-MATRIX.md` using a Markdown table format.

Matrix columns:
```text
| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
```

Status options: `stable`, `experimental`, `planned`, `removed`.

Example row:
| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| reply | `reply "hi"` | yes | yes | yes | yes | yes | yes | yes | stable | |

Start with these feature groups:

- bot config: `bot name`, `bot prefix`, `bot token from env`
- handlers: ready, command, slash, message contains/update/delete, join, leave, reaction add/remove, member update, presence update, button click, select menu, modal submit
- statements: reply, say, say embed, say with components, show modal, let, store, load, if/else, for each, require role, give/remove role, mute, kick, ban, unban, pin/unpin, reactions, create/edit/delete channel/role, dm, upload, activity, wait, try/on error
- expressions: strings, interpolation, numbers, booleans, member paths, args, target, load fallback, fetch, getUser, getGuild, random, arrays, string methods, array access, find role/channel/user
- advanced features: voice, webhooks, threads, push/random-pick, subcommands

For every feature, decide whether to make it actually work now or clearly mark it experimental/planned.

## Phase 3: Fix Lexer/Parser/AST Drift

Known issues to address:

- Parser expects `by` for `split ... by`, but lexer does not classify `by` as a keyword.
- Parser checks `getReactionUsers` as a keyword, but lexer does not classify it as one.
- Docs mention `user with id`, but parser does not implement that syntax despite AST having `FindUserExpr`.
- Docs mention single-quoted strings, but lexer only supports double-quoted strings.
- AST contains nodes that parser, interpreter, and codegen do not all support.
- Parser has duplicated branches, such as duplicated slash handler logic and duplicated `edit` handling.
- Expression parsing is left-to-right without precedence. Fix or clearly document limitations, but preferably implement precedence for arithmetic, comparison, `and`, `or`, and unary `not`.

**Expression Precedence Decision:** Use standard programming language precedence. Do not invent custom rules.

Recommended precedence, highest to lowest:
1. Parentheses
2. Unary: `not`, unary `-`
3. Multiplicative: `*`, `/`
4. Additive: `+`, `-`
5. Comparison: `<`, `<=`, `>`, `>=`
6. Equality: `==`, `!=`
7. `and`
8. `or`

For `load x y or fallback`, treat the `or` as special syntax during parsing (not boolean `or`) so it remains beginner-friendly and does not conflict with boolean `or`.
- `for each item in iterable:` parses `iterable`, but codegen ignores it.
- `args[index]` supports only numeric literals, while docs imply richer array indexing.

Acceptance criteria:

- Lexer keywords match parser expectations.
- Parser output matches AST types.
- No documented stable syntax parses into an unsupported AST node.
- Expression precedence has tests.

## Phase 4: Align `newt run` And `newt build`

**Canonical Behavior Decision:** Make the interpreter/runtime behavior the canonical source of truth, then make codegen match it.

**Reasoning:** `newt run` is the beginner path and easiest to test with mocks. The interpreter already contains more of the intended feature surface.

**Rule of thumb:**
```
Language spec/fixtures -> interpreter -> codegen
```

Not:
```
interpreter quirks -> language spec
```

Do not blindly preserve all interpreter behavior; first define expected semantics in tests, then align codegen to those tests.

Choose one canonical behavior for stable features, then make interpreter and generated JS match it.

Known issues to address:

- `newt run` uses saved CLI token even when source says `bot token from env "DISCORD_TOKEN"`, while generated JS uses `process.env.DISCORD_TOKEN`.
- Interpreter storage uses in-memory SQLite; generated JS uses `newt-store.sqlite`.
- Command args are populated in generated JS but not in interpreter.
- Slash command options are registered but not exposed consistently to Newt programs.
- String interpolation maps `user.name` to `user.username` in codegen but not in interpreter.
- `or` means nullish coalescing in codegen and logical OR in interpreter.
- `and` works in interpreter but codegen emits invalid JS.
- Generated modals/select menus use builders that are not imported.
- Interpreter supports advanced features that codegen falls through to `// TODO`.
- `fetch` JSON detection checks exact `application/json` rather than content types containing JSON.

Acceptance criteria:

- Stable feature behavior is the same in `newt run` and generated JS.
- Generated JS passes syntax validation.
- Generated JS imports everything it emits.
- Unsupported features fail validation with a clear Newt error instead of generating TODO comments.

## Phase 5: Discord Runtime Correctness

Fix Discord-specific behavior for the stable feature set.

Known issues to address:

- Command matching uses `startsWith(prefix + command)` and can match `!helloThere` for command `hello`.
- Message update/delete handlers may receive partials and need fetching or clearer limitations.
- `reply` can become a no-op in contexts without a message or interaction.
- Role/channel/target failures often only log to console; they should surface as useful Newt-level runtime errors where possible.
- `require role` must work across message commands and interactions consistently.
- Slash command registration should be predictable. Consider guild-scoped registration for dev and global registration as an explicit option.
- Interaction replies must handle already-replied/deferred interactions consistently.
- Component rows must obey Discord limits: max 5 action rows, max 5 buttons per row, select menu row constraints, custom id constraints.
- Modals must be shown only from interaction contexts.
- Voice dependency is outdated; upgrade `@discordjs/voice` or mark voice experimental.
- Webhook helper currently uses `require()` inside an ESM project; replace with ESM import or dynamic import.

Acceptance criteria:

- Stable Discord features have mock tests.
- Any real Discord integration tests are optional and gated by env vars.
- Runtime errors are actionable for a beginner.

## Phase 6: Security And Token Handling

**Token Model Decision:** Environment variable first, with `newt token` fallback and deprecation warning.

**Resolution order for `newt run`:**
1. If source says `bot token from env "NAME"`, use `process.env.NAME`
2. If env var is missing, fall back to saved `newt token` with deprecation warning
3. Later release: remove fallback or require `--use-saved-token` flag

**Deprecation warning message:**
```
Warning: DISCORD_TOKEN is not set. Falling back to token saved by `newt token`.
This fallback is deprecated; set DISCORD_TOKEN instead.
```

**Do not break existing `newt token` users immediately.** Use a deprecation period rather than an immediate breaking change.

Known issues to address:

- Saved Discord tokens are plaintext JSON in user config.
- Hardcoded bot token in a `.newt` file is only a warning.
- Docs tell users to run `newt token YOUR_BOT_TOKEN`, while source syntax says `bot token from env`.

Decide and implement a clear token model:

- Recommended local dev path.
- Recommended production path.
- Behavior of `bot token from env`.
- Behavior of `newt token`.
- Whether hardcoded tokens are disallowed by default.

Preferred direction:

- `bot token from env "DISCORD_TOKEN"` should read `process.env.DISCORD_TOKEN` in both `run` and generated JS.
- `newt token` can remain as a convenience fallback only if docs explain it.
- Hardcoded tokens should fail by default unless an explicit unsafe flag is used.
- Consider OS keychain storage for saved tokens. If not implemented, document the plaintext risk clearly.

## Phase 7: Automated Test System

**Test Framework Decision:** Use Vitest.

**Reasoning:**
- Fast execution
- Good TypeScript/ESM support
- Lightweight compared to Jest
- Works well for compiler fixture tests and mocked runtime tests

**Add from scratch with suggested scripts:**
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:discord": "vitest run test/discord"
}
```

Keep real Discord tests separate and env-gated.

Build tests so manual Discord testing is no longer the main quality gate.

Add these layers:

### 1. Compiler Fixture Tests

For each `.newt` file in `examples/`:

- tokenize
- parse
- validate
- compile
- ensure generated JS is syntactically valid

### 2. Docs Code Block Tests

Extract `newt` code blocks from docs and compile them.

If a code block is intentionally partial, mark it explicitly with a comment or metadata so the test skips it.

### 3. Interpreter Mock Tests

Use fake Discord objects:

- fake `message.reply`
- fake `channel.send`
- fake `interaction.reply`
- fake `interaction.showModal`
- fake `guild.roles.cache`
- fake `guild.channels.cache`
- fake `guild.commands.set`

Test stable behavior:

- reply
- say
- embeds
- components
- modals
- args
- target
- store/load persistence
- conditionals
- loops
- try/on error
- role checks
- role mutations
- slash options

### 4. Generated JS Smoke Tests

Compile `.newt` source to JS and verify:

- emitted JS parses
- required imports exist
- no `TODO` fallback appears for stable features
- generated package JSON includes required dependencies

### 5. Optional Real Discord Smoke Tests

Gate with environment variables:

```bash
DISCORD_TEST_TOKEN=
DISCORD_TEST_GUILD_ID=
DISCORD_TEST_CHANNEL_ID=
npm run test:discord
```

Keep this suite small:

- bot logs in
- registers one slash command
- sends/replies in test channel
- sends a component message
- optionally tests one role/channel operation in a controlled test server

Do not require Discord secrets for normal CI.

## Phase 8: Docs And Examples Truthfulness

**Experimental Features Marking Decision:** Use visible callouts plus the feature matrix.

**For docs pages, mark experimental features directly above the section:**
```markdown
> **Experimental:** This feature is available in `newt run` but may not work in generated builds yet.
```

Or:
```markdown
> **Planned:** This syntax is documented for future support and is not currently stable.
```

**Put experimental features in a separate docs section where possible:**
- Stable Reference
- Experimental Features
- Planned Features

**Key principle:** No feature should look stable unless tests prove check, run, and build support it.

Known issues to address:

- README contains mojibake/encoding damage around emoji lines.
- README says "production-ready code" despite build/runtime gaps.
- Docs advertise `deploy`, but deploy command says it is unavailable.
- Docs say Node 18+ while root package says Node 20+.
- Docs show single-quoted strings even though lexer does not support them.
- Docs show message reference editing patterns that roadmap says are currently limited.
- Docs describe advanced features as if stable when implementation is partial.
- Examples use `{user.name}` while docs mostly use `{user.username}`.

Acceptance criteria:

- Every stable docs code block is tested.
- Every example file compiles.
- Experimental/planned features are labeled.
- README claims match verified behavior.

## Suggested Work Order

1. Fix workspace/package/build failures.
2. Add minimal test framework and fixture harness.
3. Make all current examples compile or mark/remove broken examples.
4. Fix lexer/parser/validator issues caught by fixtures.
5. Fix generated JS imports and unsupported TODO fallthrough.
6. Align token, storage, args, interpolation, and operator behavior between run/build.
7. Add mock Discord runtime tests.
8. Clean docs and README.
9. Add CI.
10. Only then revisit advanced features like voice, webhooks, threads, and deployment.

## Definition Of Done

The work is done when:

- `npm install` works on a fresh checkout.
- `npm run check` passes.
- `npm run build` passes.
- `npm run test` passes.
- All examples compile.
- All stable docs code blocks compile.
- Generated JS for stable examples parses and has valid imports.
- `newt run` and `newt build` agree for stable features.
- Unsupported features fail validation clearly or are documented as experimental/planned.
- A feature matrix exists in the repo.
- CI runs build/check/tests on pull requests.
- The README no longer overclaims beyond what tests prove.

## Reporting Format For The Final PR

In the PR description, include:

- Summary of stabilization work.
- Before/after build status.
- Feature matrix link.
- List of features marked stable.
- List of features marked experimental/planned.
- Test commands run.
- Any remaining manual Discord smoke tests required.
- Known limitations intentionally left for future work.

