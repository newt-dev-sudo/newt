# Interpreter Runtime Capabilities

This document outlines the features currently supported by the Newt interpreter runtime, which executes `.newt` files directly without compilation.

## Supported Features

### Event Handlers

✅ **Ready Handler** - `on ready:`
- Executes when the bot starts up
- Can set bot activity/status
- Can send messages to channels

✅ **Command Handler** - `on command "name":`
- Responds to user commands with the configured prefix
- Provides context variables: `user`, `server`, `channel`, `message`, `target`, `args`

### Statements

✅ **Reply Statement** - `reply "message"`
- Sends a reply to the triggering message
- Supports template string interpolation

✅ **Let Statement** - `let name = value`
- Declares variables for use within a handler
- Variables are scoped to their handler
- Supports string literals, numbers, and expressions

✅ **Store Statement** - `store namespace key = value`
- Persists data to SQLite database
- Data survives bot restarts
- Syntax: `store user.id points = 100`

✅ **Load Statement** - `let data = load namespace key or default`
- Retrieves stored data from database
- Provides default value if data doesn't exist
- Syntax: `let points = load user.id points or 0`

✅ **Set Activity Statement** - `set activity "text"`
- Sets the bot's rich presence status
- Updates bot activity in Discord

### Expressions

✅ **String Literals** - `"text"`
- Basic string values
- Template string interpolation with `{variable}`
- Supports nested property access: `{userInfo.username}`

✅ **Number Literals** - `123`, `45.67`
- Integer and floating-point numbers

✅ **Boolean Literals** - `true`, `false`
- Boolean values

✅ **Identifier Expressions** - `user`, `server`, `channel`
- Access to context variables
- Property access: `user.username`, `server.name`

✅ **REST Methods**
- `getUser(userId)` - Fetch user information from Discord API
- `getGuild(guildId)` - Fetch guild information from Discord API

### Error Handling

✅ **Try/On Error** - `try: ... on error: ...`
- Catches and handles errors gracefully
- Prevents bot crashes from API failures
- Provides user-friendly error messages

### Context Variables

Available in command handlers:
- `user` - The user who triggered the command
- `server` - The server where the command was triggered
- `channel` - The channel where the command was triggered
- `message` - The message object
- `target` - The mentioned user (if any)
- `args` - Array of command arguments

## Not Yet Supported

The following features are documented but not yet implemented in the interpreter:

❌ **Say Statement** - `say "message" in channel "name"`
- Channel targeting functionality
- Requires channel lookup implementation

❌ **If/Else Statements** - `if condition: ... else: ...`
- Conditional logic
- Requires expression comparison implementation

❌ **Message Update/Delete Handlers** - `on message update:`, `on message delete:`
- Event handlers for message changes
- Partially implemented but needs testing

❌ **File Upload** - `upload "./file.png" with message "text"`
- File attachment functionality
- Requires file handling implementation

❌ **Message Editing/Deletion** - `edit message to "text"`, `delete message`
- Message modification statements
- Requires message reference tracking

❌ **Fetch Expression** - `fetch "url"`
- HTTP request functionality
- Requires fetch implementation

❌ **For Each Loops** - `for each item in collection:`
- Iteration functionality
- Requires loop implementation

❌ **Other Event Handlers**
- `on join:`, `on leave:`, `on reaction:`, etc.
- Partially implemented but need testing

## Architecture

The interpreter runtime:
- Executes `.newt` files directly without compilation
- No intermediate JavaScript files generated
- No `package.json` or `node_modules` in user directory
- Token stored in CLI configuration (secure)
- Uses Discord.js v14 for Discord API interaction
- Uses better-sqlite3 for data persistence
- Translates Discord.js errors to Newt-friendly messages

## Testing

For comprehensive testing instructions, see [Testing Full Feature Bot](./comprehensive-test.md).

## Migration from Compilation

If you were using the old compilation-based workflow:

**Old workflow:**
```bash
newt build my-bot.newt --out dist
cd dist
npm install
DISCORD_TOKEN=... npm start
```

**New workflow:**
```bash
newt token YOUR_BOT_TOKEN
newt run my-bot.newt
```

The `newt build` command is still available for advanced users who need the generated JavaScript code.
