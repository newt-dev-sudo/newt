# Newt Feature Matrix

> **Reading this table:** `stable` means the feature is implemented and works
> consistently across `newt check`, `newt run`, and `newt build`. Features
> marked `stable (unverified)` compile and run but lack automated test coverage.
> `experimental` means the feature exists in the parser/interpreter but may
> behave differently between run and build, or may produce incomplete output.
> `planned` means documented but not yet implemented. `removed` means
> previously listed but dropped.
>
> No feature is marked `stable` unless `newt check`, `newt run`, and
> `newt build` all agree on its behavior.

---

## Bot Configuration

| Feature | Syntax | check | run | build | Tests | Notes |
|---------|--------|-------|-----|-------|-------|-------|
| Bot name | `bot name "MyBot"` | ✅ | ✅ | ✅ | yes | Required |
| Bot prefix | `bot prefix "!"` | ✅ | ✅ | ✅ | yes | |
| Bot token (env) | `bot token from env "TOKEN"` | ✅ | ✅ | ✅ | yes | Recommended. Run uses env var first. Build generates env guard (Fix #15). |
| Bot token (raw) | `bot token "abc"` | ⚠️ warn | ✅ | ✅ | yes | Emits NEWT_E005 security warning. Avoid in production. |

---

## Event Handlers

| Feature | Syntax | check | run | build | Tests | Notes |
|---------|--------|-------|-----|-------|-------|-------|
| Ready | `on ready:` | ✅ | ✅ | ✅ | yes | **Fix #2**: interpreter now uses correct `"ready"` event (was `"clientReady"`). |
| Prefix command | `on command "name":` | ✅ | ✅ | ✅ | yes | |
| Message contains | `on message contains "text":` | ✅ | ✅ | ✅ | yes | |
| Message update | `on message update:` | ✅ | ✅ | ✅ | no | |
| Message delete | `on message delete:` | ✅ | ✅ | ✅ | no | |
| Member join | `on join:` | ✅ | ✅ | ✅ | yes | |
| Member leave | `on leave:` | ✅ | ✅ | ✅ | yes | **Fix #13**: `channel` is now defined in generated leave handler. |
| Reaction add | `on reaction add "emoji":` | ✅ | ✅ | ✅ | yes | Syntax is `on reaction add`; see note on remove. |
| Reaction remove | `on remove reaction "emoji":` | ✅ | ✅ | ✅ | no | Note: syntax is `on remove reaction` (asymmetric with add — known issue). |
| Member update | `on member update:` | ✅ | ✅ | ✅ | no | |
| Presence update | `on presence update:` | ✅ | ✅ | ✅ | no | |
| Slash command | `on slash "name" description "desc":` | ✅ | ✅ | ✅ | yes | **Fix #6**: registration now uses `once("ready")`. |
| Slash with options | `on slash "name" with options ...:` | ✅ | ✅ | ✅ | no | |
| Button click | `on button click "id":` | ✅ | ✅ | ✅ | yes | |
| Select menu | `on select menu "id":` | ✅ | ✅ | ✅ | no | Alias: `on menu "id":` (undocumented shorthand, Fix #11). |
| Modal submit | `on modal submit "id":` | ✅ | ✅ | ✅ | yes | **Fix #9**: validator now seeds correct scope for modal handlers. |

---

## Timers

| Feature | Syntax | check | run | build | Tests | Notes |
|---------|--------|-------|-----|-------|-------|-------|
| Every N units | `every 5 minutes:` | ✅ | ✅ | ✅ | yes | Units: second(s), minute(s), hour(s), day(s). Must be > 0. |
| Daily at time | `at "HH:MM" daily:` | ✅ | ✅ | ✅ | no | |

---

## Statements (Actions)

| Feature | Syntax | check | run | build | Tests | Notes |
|---------|--------|-------|-----|-------|-------|-------|
| Reply | `reply "text"` | ✅ | ✅ | ✅ | yes | Only valid inside command/interaction handlers. Not valid in join/leave (no message to reply to). |
| Reply ephemeral | `reply ephemeral "text"` | ✅ | ✅ | ✅ | no | |
| Say | `say "text"` | ✅ | ✅ | ✅ | yes | |
| Say to channel | `say "text" to "channel-name"` | ✅ | ✅ | ✅ | no | |
| Say embed | `say embed: title "..." ...` | ✅ | ✅ | ✅ | yes | |
| Say with components | `say "text" with components:` | ✅ | ✅ | ✅ | no | |
| Show modal | `show modal "id" title "..." ...` | ✅ | ✅ | ✅ | yes | **Fix #5**: ModalBuilder now imported correctly. |
| Let (assign) | `let x = value` | ✅ | ✅ | ✅ | yes | |
| Let be (alt syntax) | `let x be value` | ✅ | ✅ | ✅ | no | |
| Store | `store namespace key = value` | ✅ | ✅ | ✅ | yes | Backed by SQLite (`newt-store.sqlite`). |
| Load | `load namespace key` | ✅ | ✅ | ✅ | yes | |
| Load with fallback | `load namespace key or default` | ✅ | ✅ | ✅ | no | |
| If / else | `if condition:` / `else:` | ✅ | ✅ | ✅ | yes | |
| For each | `for each item in iterable:` | ✅ | ✅ | ✅ | no | **Fix #18**: codegen now emits the actual iterable (was hardcoded to guild members). |
| Require role | `require role "Name"` | ✅ | ✅ | ✅ | no | |
| Give role | `give user role "Name"` | ✅ | ✅ | ✅ | no | |
| Remove role | `remove user role "Name"` | ✅ | ✅ | ✅ | no | |
| DM | `dm target send "text"` | ✅ | ✅ | ✅ | no | |
| Mute | `mute target` | ✅ | ✅ | ✅ | no | Uses Discord timeout API. |
| Kick | `kick target` | ✅ | ✅ | ✅ | no | |
| Ban | `ban target` | ✅ | ✅ | ✅ | no | |
| Unban | `unban user.id` | ✅ | ✅ | ✅ | no | |
| Pin / Unpin | `pin message` / `unpin message` | ✅ | ✅ | ✅ | no | |
| Add reaction | `add reaction "emoji" to message` | ✅ | ✅ | ✅ | no | |
| Remove reaction | `remove reaction from message with "emoji"` | ✅ | ✅ | ✅ | no | |
| Remove all reactions | `remove all reactions from message` | ✅ | ✅ | ✅ | no | |
| Create channel | `create channel "name"` | ✅ | ✅ | ✅ | no | |
| Delete channel | `delete channel` | ✅ | ✅ | ✅ | no | |
| Edit channel | `edit channel target to "name"` | ✅ | ✅ | ✅ | no | |
| Create role | `create role "name"` | ✅ | ✅ | ✅ | no | |
| Delete role | `delete role` | ✅ | ✅ | ✅ | no | |
| Edit role | `edit role target to "name"` | ✅ | ✅ | ✅ | no | |
| Upload file | `upload "path"` | ✅ | ✅ | ✅ | no | |
| Set activity | `set activity "text"` | ✅ | ✅ | ✅ | no | |
| Wait | `wait 5 seconds` | ✅ | ✅ | ✅ | no | |
| Try / on error | `try:` / `on error:` | ✅ | ✅ | ✅ | no | Required around fetch/getUser/getGuild. |
| Edit message | `edit message to "new"` | ✅ | ✅ | ✅ | no | |
| Delete message | `delete message` | ✅ | ✅ | ✅ | no | |

---

## Expressions & Variables

| Feature | Syntax | check | run | build | Tests | Notes |
|---------|--------|-------|-----|-------|-------|-------|
| String interpolation | `"Hello {user.username}"` | ✅ | ✅ | ✅ | yes | **Fix #17**: `user.username` now accepted by validator (docs always showed this). |
| user.username | `user.username` | ✅ | ✅ | ✅ | yes | Also accepted: `user.name` (alias). |
| user.id | `user.id` | ✅ | ✅ | ✅ | yes | |
| user.mention | `user.mention` | ✅ | ✅ | ✅ | no | |
| message.content | `message.content` | ✅ | ✅ | ✅ | no | |
| channel.name | `channel.name` | ✅ | ✅ | ✅ | no | |
| server.name / server.id | `server.name` | ✅ | ✅ | ✅ | no | |
| args | `args` / `args[0]` | ✅ | ✅ | ✅ | no | **Fix #10**: slash command args now populated in run (were always empty). |
| target | `target` / `target.id` | ✅ | ✅ | ✅ | no | From message mentions. |
| Arithmetic | `x + 1`, `x * 2` | ✅ | ✅ | ✅ | no | ⚠️ No precedence yet (known issue — `1 + 2 * 3` = 9 not 7). Parens not yet supported. |
| Comparisons | `x > 10`, `x == y` | ✅ | ✅ | ✅ | yes | |
| Boolean and | `x and y` | ✅ | ✅ | ✅ | yes | **Fix #3**: generates `&&` (was emitting literal `and` causing crash). |
| Boolean or | `x or y` | ✅ | ✅ | ✅ | yes | **Fix #3**: generates `\|\|` (was emitting `??`). |
| not | `not x` | ✅ | ✅ | ✅ | no | |
| has (role check) | `user has "Role"` | ✅ | ✅ | ✅ | no | |
| Fetch | `fetch "url"` | ✅ | ✅ | ✅ | no | Must be inside `try:`. |
| getUser | `getUser(user.id)` | ✅ | ✅ | ✅ | no | Must be inside `try:`. |
| getGuild | `getGuild(server.id)` | ✅ | ✅ | ✅ | no | Must be inside `try:`. |
| getReactionUsers | `getReactionUsers(messageId, emoji)` | ✅ | ✅ | ✅ | no | Must be inside `try:`. |
| random between | `random between 1 and 10` | ✅ | ✅ | ✅ | no | |
| Math functions | `round x`, `floor x`, `ceil x` | ✅ | ✅ | ✅ | no | |
| String functions | `uppercase x`, `lowercase x`, `trim x` | ✅ | ✅ | ✅ | no | |

---

## Advanced / Experimental Features

These features exist in the parser but may not be fully consistent between
`newt run` and `newt build`. Do not rely on them for production bots.

| Feature | Status | Notes |
|---------|--------|-------|
| Voice (join/play/stop) | experimental | Works in run; codegen requires `@discordjs/voice`. |
| Webhooks | experimental | Parsed and interpreted; build support partial. |
| Threads | experimental | Parsed and interpreted; build support partial. |
| Subcommands | experimental | Parser accepts; full nested dispatch not implemented. |
| Operator precedence | known issue | `1 + 2 * 3` evaluates left-to-right. Fix planned. |
| `on reaction remove` | known issue | Syntax is `on remove reaction` (asymmetric). Fix planned. |
