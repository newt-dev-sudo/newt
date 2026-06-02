# Newt Feature Matrix

This matrix tracks the implementation status of Newt language features across all components.

**Stable** means implemented consistently across check, run, build, and covered by tests.
Rows marked stable but Tests=no should be treated as provisional until test coverage lands.

| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|

## Bot Config

| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| bot name | `bot name "MyBot"` | yes | yes | yes | yes | yes | yes | no | stable | |
| bot prefix | `bot prefix "!"` | yes | yes | yes | yes | yes | yes | no | stable | |
| bot token from env | `bot token from env "NAME"` | yes | yes | yes | yes | yes | yes | no | stable | Env-first with saved-token fallback |

## Handlers

| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| on ready | `on ready:` | yes | yes | yes | yes | yes | yes | no | stable | |
| on command | `on command "name":` | yes | yes | yes | yes | yes | yes | no | stable | Command matching lacks boundary check |
| on slash | `on slash "name":` | yes | yes | yes | yes | yes | yes | no | stable | Options not exposed to Newt programs |
| on message contains | `on message contains "text":` | yes | yes | yes | yes | yes | yes | no | stable | |
| on message update | `on message update:` | yes | yes | yes | yes | yes | yes | no | stable | May receive partials without fetching |
| on message delete | `on message delete:` | yes | yes | yes | yes | yes | yes | no | stable | May receive partials without fetching |
| on join | `on join:` | yes | yes | yes | yes | yes | yes | no | stable | |
| on leave | `on leave:` | yes | yes | yes | yes | yes | yes | no | stable | |
| on reaction add | `on reaction add "emoji":` | yes | yes | yes | yes | yes | yes | no | stable | |
| on reaction remove | `on remove reaction "emoji":` | yes | yes | yes | yes | yes | yes | no | stable | |
| on member update | `on member update:` | yes | yes | yes | yes | yes | yes | no | stable | |
| on presence update | `on presence update:` | yes | yes | yes | yes | yes | yes | no | stable | |
| on button click | `on button click "id":` | yes | yes | yes | yes | yes | yes | no | stable | |
| on menu | `on menu "id":` | yes | yes | yes | yes | yes | yes | no | stable | |
| on modal submit | `on modal submit "id":` | yes | yes | yes | yes | yes | yes | no | experimental | Generated modals use unimported builders |

## Statements

| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| reply | `reply "text"` | yes | yes | yes | yes | yes | yes | no | stable | No-op in non-message contexts |
| reply ephemeral | `reply ephemeral "text"` | yes | yes | yes | yes | yes | yes | no | stable | |
| say | `say "text"` | yes | yes | yes | yes | yes | yes | no | stable | |
| say embed | `say embed:` | yes | yes | yes | yes | yes | yes | no | stable | |
| say with components | `say with components "text":` | yes | yes | yes | yes | yes | yes | no | stable | |
| show modal | `show modal:` | yes | yes | yes | yes | yes | yes | no | experimental | Generated modals use unimported builders |
| let | `let x = value` | yes | yes | yes | yes | yes | yes | no | stable | |
| store | `store namespace key = value` | yes | yes | yes | yes | yes | yes | no | stable | Both run and build use persistent SQLite |
| load | `let x = load namespace key or default` | yes | yes | yes | yes | yes | yes | no | stable | Both run and build use persistent SQLite |
| if/else | `if condition: ... else: ...` | yes | yes | yes | yes | yes | yes | no | stable | |
| for each | `for each item in iterable:` | yes | yes | yes | yes | partial | partial | no | experimental | Iterable ignored in codegen |
| require role | `require role "RoleName"` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen |
| give role | `give user role "RoleName"` | yes | yes | yes | yes | yes | yes | no | stable | |
| remove role | `remove user role "RoleName"` | yes | yes | yes | yes | yes | yes | no | stable | |
| mute | `mute user for duration` | yes | yes | yes | yes | yes | yes | no | stable | |
| kick | `kick user` | yes | yes | yes | yes | yes | yes | no | stable | |
| ban | `ban user` | yes | yes | yes | yes | yes | yes | no | stable | |
| unban | `unban user` | yes | yes | yes | yes | yes | yes | no | stable | |
| pin message | `pin message` | yes | yes | yes | yes | yes | yes | no | stable | |
| unpin message | `unpin message` | yes | yes | yes | yes | yes | yes | no | stable | |
| add reaction | `add reaction "emoji"` | yes | yes | yes | yes | yes | yes | no | stable | |
| remove reaction | `remove reaction "emoji"` | yes | yes | yes | yes | yes | yes | no | stable | |
| clear reactions | `clear reactions` | yes | yes | yes | yes | yes | yes | no | stable | |
| create role | `create role "Name"` | yes | yes | yes | yes | yes | yes | no | stable | |
| delete role | `delete role "Name"` | yes | yes | yes | yes | yes | yes | no | stable | |
| edit role | `edit role "Name" newName "NewName"` | yes | yes | yes | yes | yes | yes | no | stable | |
| dm send | `dm send user "message"` | yes | yes | yes | yes | yes | yes | no | stable | |
| upload | `upload "./file.png"` | yes | yes | yes | yes | yes | yes | no | stable | |
| set activity | `set activity "text"` | yes | yes | yes | yes | yes | yes | no | stable | |
| wait | `wait for duration` | yes | yes | yes | yes | yes | yes | no | stable | |
| try/on error | `try: ... on error: ...` | yes | yes | yes | yes | yes | yes | no | stable | |

## Expressions

| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| strings | `"text"` | yes | yes | yes | yes | yes | yes | no | stable | Single quotes documented but not supported |
| interpolation | `{variable}` | yes | yes | yes | yes | partial | partial | no | experimental | user.name vs user.username mismatch |
| numbers | `123`, `45.67` | yes | yes | yes | yes | yes | yes | no | stable | |
| booleans | `true`, `false` | yes | yes | yes | yes | yes | yes | no | stable | |
| member paths | `user.username` | yes | yes | yes | yes | yes | yes | no | stable | |
| args | `args` | yes | yes | yes | yes | yes | yes | yes | stable | Populated in interpreter |
| target | `target` | yes | yes | yes | yes | yes | yes | no | stable | |
| load fallback | `load x y or z` | yes | yes | yes | yes | yes | yes | no | stable | Treated as special syntax |
| fetch | `fetch "url"` | yes | yes | yes | yes | yes | yes | no | stable | JSON detection too strict |
| getUser | `getUser(id)` | yes | yes | yes | yes | yes | yes | no | stable | |
| getGuild | `getGuild(id)` | yes | yes | yes | yes | yes | yes | no | stable | |
| getReactionUsers | `getReactionUsers(msg, emoji)` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen |
| random | `random(min, max)` | yes | yes | yes | yes | yes | yes | no | stable | |
| arrays | `[1, 2, 3]` | yes | yes | yes | yes | yes | yes | no | stable | |
| string methods | `text.uppercase()` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen |
| array access | `items[0]` | yes | yes | yes | yes | yes | yes | no | stable | Only numeric literals supported |
| array length | `length of items` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen |
| find role | `find role "Name"` | yes | yes | yes | yes | yes | yes | no | stable | |
| find channel | `find channel "Name"` | yes | yes | yes | yes | yes | yes | no | stable | |
| find user | `user with id "123"` | yes | yes | no | yes | yes | no | no | experimental | Not implemented in parser |

## Operators

| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| and | `a and b` | yes | yes | yes | yes | yes | no | yes | experimental | Codegen emits invalid JS |
| or | `a or b` | yes | yes | yes | yes | yes | yes | yes | experimental | Different behavior in run vs build |
| not | `not a` | yes | yes | yes | yes | yes | yes | yes | stable | |
| comparison | `<`, `<=`, `>`, `>=` | yes | yes | yes | yes | yes | yes | yes | experimental | No operator precedence |
| equality | `==`, `!=` | yes | yes | yes | yes | yes | yes | no | experimental | No operator precedence |
| arithmetic | `+`, `-`, `*`, `/` | yes | yes | yes | yes | yes | yes | yes | experimental | No operator precedence |

## Advanced Features

| Feature | Syntax | Docs | Lexer | Parser | Validator | Run | Build | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| voice | `join voice`, `play audio` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen |
| webhooks | `create webhook` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen, uses require() |
| threads | `create thread` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen |
| push | `push array value` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen |
| subcommands | Slash subcommands | yes | yes | yes | yes | yes | yes | no | experimental | |
| timers | `every`, `at daily` | yes | yes | yes | yes | yes | no | no | experimental | Not supported in codegen |

## Status Legend

- **stable**: Feature works in check, run, and build with consistent behavior
- **experimental**: Feature works in some contexts but not all, or has known limitations
- **planned**: Syntax is documented but not yet implemented
- **removed**: Feature was removed or deprecated
