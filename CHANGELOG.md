# Changelog

## [Unreleased] — Stabilization PR: fix/stabilize-core-bugs

This PR fixes all critical, high, and medium severity bugs identified in the
repository analysis. No new features are added. The goal is to make the existing
stable feature set actually work correctly and consistently between `newt run`
and `newt build`.

### Critical Bug Fixes

#### Fix #1 — Duplicate `SlashCommandHandler` case in validator (dead code)
**File:** `packages/compiler/src/validator.ts`

The `visitTopLevel()` switch had the `SlashCommandHandler` case written out
twice. The second occurrence was unreachable because the first already returned.
Removed the duplicate. This had no user-visible effect by itself but masked the
absence of proper slash handler validation.

#### Fix #2 — `on ready:` blocks never fired in `newt run`
**File:** `packages/cli/src/interpreter.ts`

The interpreter used `this.client.once("clientReady", ...)` to set up ready
handlers. The correct Discord.js v14 event name is `"ready"`, not
`"clientReady"`. As a result, every `on ready:` block in every `.newt` file
was silently ignored when running with `newt run`. The codegen (`newt build`)
correctly used `"ready"`, so the same program behaved differently depending on
how it was run. **Fixed by changing `"clientReady"` → `"ready"`.**

#### Fix #3 — `and`/`or` emitted literally into JavaScript (syntax crash)
**File:** `packages/compiler/src/codegen.ts`

The code generator emitted `and` and `or` as raw text into generated JavaScript.
JavaScript does not have `and` or `or` operators — they must be `&&` and `||`.
Any generated bot using `if x and y:` or `if x or y:` would crash immediately
with a JavaScript `SyntaxError` before even logging in. **Fixed by mapping
`and` → `&&` and `or` → `||` in `emitExpression`.**

---

### High Severity Bug Fixes

#### Fix #5 — Codegen import list was hardcoded and missing modal builders
**File:** `packages/compiler/src/codegen.ts`

The generated `bot.js` import line was hardcoded. It did not include
`ModalBuilder`, `TextInputBuilder`, or `TextInputStyle`, which are required for
any bot that uses `show modal`. Any generated bot with modal support would crash
with `ReferenceError: ModalBuilder is not defined`. **Fixed by building the
import list dynamically based on which features the program actually uses.**

#### Fix #6 — Slash command re-registration on reconnect + missing null check
**File:** `packages/compiler/src/codegen.ts`

Slash commands were registered inside `client.on("ready", ...)`. Using `on`
instead of `once` meant every reconnect would attempt to re-register all slash
commands, which is wasteful and may hit Discord API rate limits. Additionally,
`client.application` was accessed without a null check, which could cause an
unhandled rejection if the application cache was not populated. **Fixed by
using `client.once("ready", ...)` and adding a null guard.**

#### Fix #7 — ~15 duplicate entries in the lexer keywords Set
**File:** `packages/compiler/src/lexer.ts`

The keywords `Set` was assembled by copy-pasting keyword groups without
removing duplicates. Affected keywords: `role` (×3), `channel` (×3), `add`,
`join`, `leave`, `member`, `update`, `description`, `with`, `send`, `from`,
`reaction`, `create`, `random` (each ×2). JavaScript `Set` silently deduplicates,
so this caused no crash, but it made the keyword list confusing and unmaintainable.
**Fixed by rewriting the Set with each keyword appearing exactly once, organized
into logical groups with comments.**

---

### Medium Severity Bug Fixes

#### Fix #9 — `ModalSubmitHandler` used empty scope in validator
**File:** `packages/compiler/src/validator.ts`

`ModalSubmitHandler` had no dedicated case in `visitTopLevel()`, so it fell
through to the `default` branch which called `visitStatements` with an empty
scope `new Set()`. This caused false "variable not defined" validation errors
for perfectly valid uses of `user`, `channel`, `server`, `interaction`, and
`fields` inside `on modal submit:` blocks. **Fixed by adding a dedicated case
with the correct scope: `{ user, channel, server, interaction, fields }`.**

#### Fix #10 — Slash command `args` always empty in `newt run`
**File:** `packages/cli/src/interpreter.ts`

The interpreter's `SlashCommandHandler` context always set `args: []`. Slash
command option values were never extracted from `interaction.options`. Users
who wrote `let x = args[0]` inside a slash handler would always get `undefined`
in `newt run`. The codegen correctly set `const args = interaction.options`,
creating a divergence. **Fixed by populating `args` from
`interaction.options.data.map((opt) => opt.value)`.**

#### Fix #11 — Undocumented duplicate `on menu` syntax
**File:** `packages/compiler/src/parser.ts` (noted, no code change needed)

Both `on menu "id":` and `on select menu "id":` parse to the same
`SelectMenuHandler`. The `on menu` shorthand is not documented. This is noted
in the docs update below. No parser change is needed but this is documented
as a known alias.

#### Fix #12 — `"second"` keyword listed twice (time unit and ordinal)
**File:** `packages/compiler/src/lexer.ts`

`"second"` appeared in the keywords Set both near the time units (`seconds`,
`second`, `minutes`) and near the ordinals (`first`, `second`, `third`).
**Fixed as part of Fix #7** — `"second"` now appears exactly once, near the
time units. Context-dependent meaning is resolved at parse time.

#### Fix #13 — `LeaveHandler` generated code missing `channel` variable
**File:** `packages/compiler/src/codegen.ts`

The generated `guildMemberRemove` handler did not define a `channel` variable,
while the matching `guildMemberAdd` (JoinHandler) did. Any `say` or
channel-targeting statement inside `on leave:` would throw
`ReferenceError: channel is not defined` in the generated bot.
**Fixed by adding `const channel = server.systemChannel ?? findChannel(server, "general");`
to the LeaveHandler emitter, matching the JoinHandler.**

---

### Low Severity / Documentation Fixes

#### Fix #14 — `NEWT_E016` error code defined but never emitted
**File:** `packages/compiler/src/codegen.ts`

Error code `NEWT_E016` ("This feature is not supported in generated builds")
was defined in `errors.ts` but never actually thrown anywhere — raw JavaScript
errors were thrown instead when unsupported statement types were encountered.
**Fixed by using `makeCatalogError("NEWT_E016", ...)` in the `default` branch
of `emitStatement`, so users get a proper Newt error message instead of a
raw stack trace.**

#### Fix #15 — No guard for missing `DISCORD_TOKEN` env var in generated bot
**File:** `packages/compiler/src/codegen.ts`

Generated bots called `client.login(process.env.DISCORD_TOKEN)` without
checking whether the variable was set. A missing env var would cause Discord.js
to throw a confusing `"Token must be a string"` error. **Fixed by generating
a startup guard that prints a clear error message and exits with code 1 if the
required env var is not set.**

#### Fix #17 — `user.username` not in validator builtIns despite being in all docs
**File:** `packages/compiler/src/validator.ts`

The docs (README, quickstart, reference, examples) consistently use
`{user.username}` for string interpolation, but the validator's `builtIns` Set
only contained `user.name`. This did not cause runtime errors (interpolation
is not validated), but created a misleading inconsistency. **Fixed by adding
`user.username` to `builtIns`** alongside `user.name` for backwards compatibility.

#### Fix #18 — `for each` loop codegen ignored the iterable expression
**File:** `packages/compiler/src/codegen.ts`

The `ForEachStatement` emitter hardcoded `server.members.cache.values()` as
the iteration target regardless of what the user actually wrote. **Fixed by
emitting the actual iterable expression** from the AST node.

---

### Test Suite Expansion

**File:** `test/compiler.test.ts`

Replaced the minimal test stub with a comprehensive test suite covering:
- All stable handler types (command, slash, join, leave, reaction, button, modal, etc.)
- Validator acceptance/rejection of known-good and known-bad programs
- Fix-specific regression tests for all critical and high bugs
- Codegen sanity checks (no `and`/`or` literals, no TODO comments, correct imports)
- **All example `.newt` files are now compiled automatically** — if any documented
  example breaks, the test suite fails.
