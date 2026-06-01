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

✅ **Message Contains Handler** - `on message contains "text":`
- Triggers when any message contains specific text
- Useful for keyword detection and auto-responses

✅ **Join Handler** - `on join:`
- Triggers when a new member joins the server
- Perfect for onboarding and auto-role assignment

✅ **Leave Handler** - `on leave:`
- Triggers when a member leaves the server
- Useful for logging and cleanup

✅ **Reaction Add Handler** - `on reaction add "emoji":`
- Triggers when someone reacts to a message
- Great for reaction-based commands and polls

✅ **Message Update Handler** - `on message update:`
- Triggers when a message is edited
- Useful for message edit logging

✅ **Message Delete Handler** - `on message delete:`
- Triggers when a message is deleted
- Useful for message deletion logging

### Statements

✅ **Reply Statement** - `reply "message"`
- Sends a reply to the triggering message
- Supports template string interpolation

✅ **Say Statement** - `say "message"` or `say "message" in channel "name"`
- Sends a message to current or specified channel
- Channel targeting with `in channel "name"`

✅ **Say Embed Statement** - `say embed:`
- Sends rich embedded messages with formatting, colors, and structured content
- Supports title, description, color, and fields

✅ **Say Components Statement** - `say with components "message":`
- Sends messages with interactive buttons or select menus
- Supports buttons and select menus

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

✅ **If/Else Statement** - `if condition: ... else: ...`
- Conditional logic for branching behavior
- Supports comparison operators

✅ **For Each Loop** - `for each item in collection:`
- Iterates through collections (like server members)
- Useful for bulk operations

✅ **Give Role Statement** - `give user role "RoleName"`
- Assigns a role to a user
- Requires role to exist in server

✅ **Remove Role Statement** - `remove user role "RoleName"`
- Removes a role from a user
- Requires role to exist in server

✅ **Mute Statement** - `mute user for duration`
- Gives user a "Muted" role for specified time
- Requires "Muted" role to exist in server

✅ **Kick Statement** - `kick user`
- Kicks a user from the server
- User can rejoin with invite

✅ **Ban Statement** - `ban user`
- Bans a user from the server
- User cannot rejoin

✅ **Upload Statement** - `upload "./file.png" with message "text"`
- Uploads files to Discord
- Supports optional message with file

✅ **Set Activity Statement** - `set activity "text"`
- Sets the bot's rich presence status
- Updates bot activity in Discord

✅ **Wait Statement** - `wait for duration`
- Pauses execution for specified time
- Supports seconds, minutes, hours, days

✅ **Try/On Error** - `try: ... on error: ...`
- Catches and handles errors gracefully
- Prevents bot crashes from API failures
- Provides user-friendly error messages

### Expressions

✅ **String Literals** - `"text"`
- Basic string values
- Template string interpolation with `{variable}`
- Supports nested property access: `{userInfo.username}`

✅ **Number Literals** - `123`, `45.67`
- Integer and floating-point numbers

✅ **Boolean Literals** - `true`, `false`
- Boolean values

✅ **Color Literals** - `#5865F2`
- Hex color codes for embeds

✅ **Identifier Expressions** - `user`, `server`, `channel`
- Access to context variables
- Property access: `user.username`, `server.name`

✅ **REST Methods**
- `getUser(userId)` - Fetch user information from Discord API
- `getGuild(guildId)` - Fetch guild information from Discord API

✅ **Fetch Expression** - `fetch "url"`
- HTTP request functionality
- Returns JSON or text based on content-type

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

❌ **Slash Commands** - `on slash "name":`
- Discord's modern slash commands
- Requires Discord API registration

❌ **Button Click Handler** - `on button click "id":`
- Handles button interactions
- Requires interaction handling

❌ **Select Menu Handler** - `on select menu "id":`
- Handles dropdown menu selections
- Requires interaction handling

⚠️ **Message Editing/Deletion Statements** - `edit message to "text"`, `delete message`
- Implemented but syntax issue: `let botMessage = reply` not supported
- Requires language design change for message references

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
