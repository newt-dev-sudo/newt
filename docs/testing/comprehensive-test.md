# Testing Full Feature Bot

This document provides step-by-step instructions for testing the full feature bot which covers all documented Newt language features using the new interpreter runtime.

## Setup

1. Save your Discord token:
   ```bash
   newt token YOUR_BOT_TOKEN
   ```

2. Run the full test bot:
   ```bash
   newt run examples/full-test.newt
   ```

## Test Cases

### 1. Ready Handler & Activity Status

**Test:**
- When the bot starts, check the bot's status in Discord
- It should show "Testing all features" under the bot's name

**Expected Result:**
- Bot comes online with activity "Testing all features"

---

### 2. Reply Statement

**Command:**
```
!test-reply
```

**Expected Result:**
- Bot replies: "This is a reply test"

---

### 3. Let Statement & Variables

**Command:**
```
!test-let
```

**Expected Result:**
- Bot replies: "Hello, [your username]!"
- Tests variable declaration and template string interpolation

---

### 4. Store Statement

**Command:**
```
!test-store
```

**Expected Result:**
- Bot replies: "Data stored"
- Stores points value in database for the user

---

### 5. Load Statement

**Command:**
```
!test-load
```

**Expected Result:**
- Bot replies: "Loaded: [points value]"
- Retrieves stored data from database

---

### 6. REST Method - getUser

**Command:**
```
!test-getuser @mention_a_user
```

**Expected Result:**
- Bot replies: "User: [username]"
- Tests Discord REST API user fetching

**Error Case:**
- If no user is mentioned, bot replies: "Mention a user first"

---

### 7. REST Method - getGuild

**Command:**
```
!test-getguild
```

**Expected Result:**
- Bot replies: "Guild: [server name]"
- Tests Discord REST API guild fetching

**Error Case:**
- If guild fetch fails, bot replies: "Could not fetch guild"

---

### 8. Error Handling (try/on error)

**Command:**
```
!test-error
```

**Expected Result:**
- Bot replies: "Error caught successfully"
- Tests error handling with invalid user ID

---

### 9. Set Activity

**Command:**
```
!test-activity
```

**Expected Result:**
- Bot replies: "Activity set"
- Bot's activity changes to "Custom activity"

---

## Cleanup

To stop the bot:
- Press `Ctrl+C` in the terminal

To remove the bot from your server:
- Go to Discord Server Settings > Integrations
- Find and remove the bot

## Troubleshooting

**Bot doesn't start:**
- Check that your token is set: `newt token` (should show "Token is set")
- Verify the token has the necessary intents
- Check that `node` and `npm` are installed

**Commands don't work:**
- Ensure the bot has the "Message Content Intent" enabled in the Discord Developer Portal
- Check that the bot has permission to read messages in the channel

**REST methods fail:**
- Ensure the bot has the necessary permissions
- Check that the user/guild IDs are valid
- Verify the bot is in the server (for getGuild)

## Feature Summary

The following features are tested with the interpreter runtime:

1. ✅ **Ready Handler** - `on ready:` - Bot startup event
2. ✅ **Command Handler** - `on command "name":` - Command handling
3. ✅ **Reply Statement** - `reply "message"` - Reply to messages
4. ✅ **Let Statement** - `let name = value` - Variable declaration
5. ✅ **Store Statement** - `store namespace key = value` - Persist data
6. ✅ **Load Statement** - `let data = load namespace key or default` - Retrieve data
7. ✅ **Template Strings** - `{variable}` - String interpolation
8. ✅ **REST Method - getUser** - `getUser(userId)` - Fetch user info
9. ✅ **REST Method - getGuild** - `getGuild(guildId)` - Fetch guild info
10. ✅ **Error Handling** - `try: ... on error: ...` - Exception handling
11. ✅ **Set Activity** - `set activity "text"` - Rich presence

## Interpreter Runtime Notes

This test uses the new interpreter runtime which:
- Executes `.newt` files directly without compilation
- No intermediate JavaScript files generated
- No `package.json` or `node_modules` in user directory
- Token stored in CLI configuration
- Errors translated to Newt-friendly messages

## Known Limitations

The following features are documented but not yet tested in this bot:
- `say` statement (channel targeting)
- `if/else` statements (conditional logic)
- Message update/delete event handlers
- File upload
- Message editing/deletion
- Fetch expression
- For each loops

These features require additional implementation in the interpreter or syntax adjustments.
