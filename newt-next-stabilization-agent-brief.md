# Newt Next Stabilization Agent Brief

This brief is for agents continuing work on `newt-dev-sudo/newt` after commit `39df25a`.

The repository has made meaningful progress: the monorepo now builds, Vitest has been introduced, a feature matrix exists, the VSIX artifact was removed, token handling was improved, command args are populated in the interpreter, and `newt run` storage now uses `newt-store.sqlite`.

However, the project is not yet stabilized. The next work should focus on turning the current foundation into a reliable, tested language/runtime system.

## Current Verified State

From local review of commit `39df25a`:

- `npm run check` passes.
- `npm run build` passes.
- `npm run test` passes when run normally outside the Codex sandbox.
- `npm run test` may fail inside restricted sandbox environments because Vitest/esbuild tries to read paths above the workspace while loading `vitest.config.ts`.
- The test suite is currently shallow: it mostly checks tokenization/parsing of a few examples.
- `docs/FEATURE-MATRIX.md` exists, but some rows are already stale relative to the implementation.

Important: do not assume the feature matrix is fully truthful yet. Treat it as a starting inventory, not a verified spec.

## Main Goal

Make Newt trustworthy for a stable beginner feature set.

The stable beginner path should include:

- bot config
- command handlers
- slash handlers, basic
- reply
- say
- embeds
- let
- store/load
- if/else
- args
- target
- role checks/mutations where supported consistently
- basic fetch/getUser/getGuild inside `try`
- generated JS that starts without syntax/import errors

Advanced features such as voice, webhooks, threads, subcommands, complex components, modals, and timers should either be made fully consistent across check/run/build or clearly marked experimental/planned and prevented from masquerading as stable.

## Non-Negotiable Principles

- Do not add new features until the stable surface is consistent.
- Do not mark a feature stable unless `check`, `run`, `build`, and tests agree.
- Do not leave generated JS with unsupported `TODO` comments for validated syntax.
- Do not let documentation claim behavior that tests do not cover.
- Prefer a smaller honest language over a larger half-working one.
- Every docs/example syntax promoted as stable must compile in tests.
- Real Discord integration tests must remain optional and env-gated.

## Recommended Work Order

### Step 1: Repair And Strengthen The Test Harness

Current tests pass but are too weak. Expand them before deeper behavior rewrites.

Tasks:

- Make `npm run test` robust in common local/CI environments.
- Consider simplifying/removing `vitest.config.ts` if it causes path resolution issues in restricted environments.
- Add a dedicated compiler fixture test that discovers every `.newt` file in `examples/`.
- For every example:
  - tokenize
  - parse
  - validate
  - compile with `compile()`
  - assert generated `botJs` and `packageJson` exist when compilation succeeds
- Add generated-JS smoke checks:
  - generated code should not contain `// TODO`
  - generated code should not contain obvious invalid operators like raw ` and `
  - generated code should include every Discord builder it emits
  - generated package JSON should include every runtime dependency it imports
- Add parser/precedence tests before changing expression parsing.

Acceptance criteria:

```bash
npm run check
npm run build
npm run test
```

All pass. Tests fail when a documented stable example breaks.

### Step 2: Fix The Feature Matrix So It Reflects Reality

`docs/FEATURE-MATRIX.md` is useful but currently stale in places.

Known stale or suspicious entries:

- `bot token from env` says run uses saved token; code now attempts env first with saved-token fallback.
- `store/load` says run uses in-memory storage; code now uses `newt-store.sqlite`.
- `args` says not populated in interpreter; code now populates command args.
- `getReactionUsers` says not a lexer keyword; lexer now includes it.
- modal rows say generated builders are unimported; verify whether this is still true before leaving the note.
- many rows are marked stable while tests are still `no`.

Tasks:

- Update rows that are clearly stale.
- Downgrade any "stable" feature without meaningful tests to `experimental` or `stable-unverified`, or keep `stable` but set tests to `no` and add a clear note. Prefer honesty.
- Add a short header note:

```md
Stable means implemented consistently across check, run, build, and covered by tests.
Rows marked stable but Tests=no should be treated as provisional until test coverage lands.
```

Better option:

- Use statuses only:
  - `stable`
  - `experimental`
  - `planned`
  - `removed`
- Do not mark anything `stable` unless tests exist.

Acceptance criteria:

- No matrix row contradicts the current code.
- Matrix makes it obvious what can be safely used today.

### Step 3: Implement Expression Precedence Correctly

The parser still uses a flat expression parser. This creates incorrect behavior for arithmetic and boolean logic.

Implement standard precedence:

1. Parentheses
2. Unary `not`, unary `-`
3. Multiplicative `*`, `/`
4. Additive `+`, `-`
5. Comparison `<`, `<=`, `>`, `>=`
6. Equality `==`, `!=`
7. `and`
8. `or`

Important decisions:

- Keep `load namespace key or fallback` as special fallback syntax, not general boolean `or`.
- Make interpreter and codegen agree on `and` and `or`.
- `and` should generate JavaScript `&&`.
- Boolean `or` should generate JavaScript `||`.
- If the language wants fallback/nullish behavior, use explicit load fallback or define a separate operator later.

Add tests for:

```newt
let x = 1 + 2 * 3
let x = (1 + 2) * 3
if true or false and false:
if not false and true:
if points >= 10 and points < 20:
let points = load user.id points or 0
```

Acceptance criteria:

- AST structure reflects correct precedence.
- Interpreter and codegen produce equivalent behavior for stable operators.
- Matrix operator notes are updated.

### Step 4: Align Codegen With Interpreter For The Stable Surface

The largest remaining risk is divergence between `newt run` and `newt build`.

Focus on stable features first.

Known issues to verify/fix:

- Codegen still emits raw `and` unless fixed.
- Codegen uses `??` for `or` while interpreter uses `||`; decide and align.
- `for each item in iterable` parses an iterable but codegen historically ignored it.
- Generated modal/component code may emit builders not imported.
- Codegen throws for unsupported statement types. That is better than TODO, but the compiler may throw after validation instead of returning a clean Newt error.

Tasks:

- Add a generated-JS test for each stable feature.
- Make generated code import every emitted Discord builder.
- Make generated code syntax-checkable.
- Convert unsupported-build features into validator errors or warnings before codegen, instead of throwing late from `generate()`.
- If a feature works in `run` but not `build`, mark it experimental and make `newt build` fail with a friendly error.

Acceptance criteria:

- `compile()` should not crash with a raw JavaScript/TypeScript exception for user syntax.
- `newt build` should either emit valid JS or print a useful Newt error.
- No stable feature behaves differently in `run` and `build`.

### Step 5: Token Behavior And Docs Cleanup

Token behavior was improved, but docs are still mixed.

Desired behavior:

1. `bot token from env "DISCORD_TOKEN"` means use `process.env.DISCORD_TOKEN`.
2. `newt token` may remain as a fallback for local dev during a deprecation period.
3. If env var is missing and saved token is used, print a warning.
4. Generated JS should use env vars only, unless a separate explicit mechanism is designed.

Docs to update:

- README
- docs/security.md
- docs/quickstart.md
- docs/troubleshooting.md
- docs/getting-started/understanding-errors.md
- packages/cli help text if needed

Remove or revise wording that says `bot token from env` uses the token saved by `newt token`.

Acceptance criteria:

- Docs describe one coherent token model.
- Beginner path remains clear.
- Existing `newt token` users are not broken abruptly.

### Step 6: Improve Compiler Errors For Unsupported Features

Right now unsupported build features may fail late in codegen.

Better behavior:

- Validator should know which features are stable for build.
- `newt check` can optionally warn about run-only/build-unsupported features.
- `newt build` should fail cleanly with an actionable Newt error.

Possible approach:

- Add compile/build mode:

```ts
compile(source, filename, { target: "run" | "build" | "check" })
```

Or less invasive:

- Add `validateBuildSupport(program)` and call it from `buildCommand`.

Suggested user-facing error:

```text
Error [NEWT_E_BUILD_UNSUPPORTED] on line X:
This feature works in `newt run` but is not supported by `newt build` yet.
Use `newt run`, or remove/replace this feature.
```

Acceptance criteria:

- No raw `Statement type "..." is not supported` stack traces for normal user code.
- Build limitations are clear and documented.

### Step 7: Extract And Test Docs Code Blocks

Docs are currently a major source of language drift.

Tasks:

- Add a test utility that extracts fenced code blocks marked `newt`.
- Compile each complete block.
- Allow explicit skip markers for partial snippets:

```md
```newt skip
reply "partial snippet"
```
```

or:

```md
<!-- newt-test: skip partial -->
```

- Start with:
  - README.md
  - docs/quickstart.md
  - docs/examples/*.md
  - docs/reference/*.md

Known docs issues:

- Single-quoted strings are documented but not supported.
- Some message-reference editing examples contradict roadmap limitations.
- Some advanced features appear stable but are experimental.
- README still claims "production-ready code"; revise unless fully verified.

Acceptance criteria:

- Stable docs examples are executable tests.
- Partial snippets are explicitly marked.
- Experimental examples are clearly labeled.

### Step 8: Add Mock Runtime Tests

Manual Discord testing should not be the main quality gate.

Add fake Discord objects and test interpreter behavior without logging into Discord.

Start with:

- `reply` on message
- `say` to channel
- `let` variable
- interpolation
- command args
- `store/load`
- `if/else`
- `try/on error`
- role lookup failure
- slash interaction reply

This may require making interpreter internals testable. Prefer small, careful changes:

- expose a narrow test helper
- inject a fake client/database
- split execution engine from Discord client setup

Do not rewrite the whole interpreter unless necessary.

Acceptance criteria:

- Core stable features have mock runtime tests.
- Tests do not require Discord credentials.

### Step 9: Optional Real Discord Smoke Tests

Only after mock tests are useful.

Add `npm run test:discord` behind env vars:

```bash
DISCORD_TEST_TOKEN=
DISCORD_TEST_GUILD_ID=
DISCORD_TEST_CHANNEL_ID=
npm run test:discord
```

Keep this small:

- login
- register one slash command in test guild
- send or reply in one channel
- optionally send a component message

Acceptance criteria:

- Normal CI does not require secrets.
- Release maintainers can run a real Discord sanity suite.

## Known Issues To Prioritize

### High Priority

- Test coverage is shallow.
- Feature matrix is stale in multiple rows.
- Expression precedence is not implemented.
- `and`/`or` semantics likely still differ between run/build.
- Build-unsupported features should fail validation cleanly.
- Docs token story is inconsistent.
- Stable docs examples are not yet tested.

### Medium Priority

- Command matching still appears to use prefix+command `startsWith`; add a boundary check so `!helloThere` does not trigger `hello`.
- Fetch JSON detection should accept content types containing `application/json`, not only exact equality.
- Single quotes are documented but unsupported; either implement or remove from docs.
- Update README "production-ready code" wording until generated output is properly smoke-tested.
- Audit warnings appeared after dependency refresh; investigate with `npm audit` in a normal environment.

### Lower Priority / Advanced

- Voice support and `@discordjs/voice` dependency health.
- Webhooks using `require()` in an ESM package.
- Thread creation limitations.
- Slash subcommands.
- Modal and advanced select-menu generated code.
- VS Code grammar alignment with actual lexer/parser.

## Suggested PR Breakdown

### PR 1: Test Truth Foundation

- Fix/robustify Vitest setup.
- Expand example fixture tests.
- Add generated JS smoke tests.
- Update feature matrix stale rows.

### PR 2: Expression And Backend Semantics

- Implement expression precedence.
- Align `and`/`or`.
- Add interpreter/codegen equivalence tests for operators.

### PR 3: Build Support Validation

- Add build-target validation.
- Friendly errors for run-only features.
- Remove late raw codegen failures for user syntax.

### PR 4: Docs As Tests

- Extract docs code blocks.
- Mark partial/experimental snippets.
- Fix token docs and overclaims.

### PR 5: Runtime Mock Tests

- Refactor minimally for testable interpreter execution.
- Add mock Discord tests for stable features.

## Verification Commands

Run after each PR:

```bash
npm install
npm run check
npm run build
npm run test
```

Also run when generated JS behavior changes:

```bash
npm run test -- --run
```

If Discord smoke tests exist and secrets are available:

```bash
npm run test:discord
```

## Final Definition Of Done For Stabilization

Newt is stabilized when:

- Fresh checkout installs cleanly.
- Check/build/test pass.
- Feature matrix matches reality.
- Stable features are covered by tests.
- Every stable example compiles.
- Stable docs code blocks compile.
- Generated JS for stable examples parses and imports correctly.
- `newt run` and `newt build` agree for stable semantics.
- Run-only/build-unsupported features fail cleanly or are marked experimental.
- Token docs are coherent.
- Manual Discord testing is only a release smoke check, not the primary test method.

