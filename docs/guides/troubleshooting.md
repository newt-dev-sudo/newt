# Troubleshooting Guide

This guide helps you diagnose and fix common issues when working with Newt.

## Build Errors

### "Check the Newt syntax for this line"

**Problem:** Syntax error in your Newt file

**Common causes:**
- Missing quotes around strings
- Incorrect keyword usage
- Missing indentation
- Invalid variable names

**Solutions:**
```javascript
# Wrong
let x = hello world

# Correct
let x = "hello world"
```

```javascript
# Wrong
on command ping:
    reply "Pong"

# Correct
on command "ping":
    reply "Pong"
```

```javascript
# Wrong
if points > 100
    reply "Level up"

# Correct
if points > 100:
    reply "Level up"
```

### "Expected a value"

**Problem:** Missing expression or value

**Solution:**
```javascript
# Wrong
let x =

# Correct
let x = 42
```

### "Unknown command: compile"

**Problem:** Using wrong CLI command

**Solution:**
```bash
# Wrong
newt compile bot.newt

# Correct
newt build bot.newt
```

## Runtime Errors

### Bot won't start

**Problem:** Bot fails to start or crashes immediately

**Check:**
1. Token is set correctly
```bash
export DISCORD_TOKEN=your_token
npm start
```

2. Token has correct permissions
   - Bot should be in the server
   - Bot should have necessary permissions (Send Messages, etc.)

3. Check logs for specific error messages

### Commands not responding

**Problem:** Slash commands or prefix commands don't work

**Check:**
1. Slash commands need to be registered
   - Start the bot once to register commands
   - Wait a few minutes for Discord to process

2. Prefix commands need correct prefix
```javascript
bot prefix "!"  # Make sure this matches what you type
```

3. Check bot has message content intent enabled
   - Go to Discord Developer Portal
   - Bot settings → Bot → Privileged Gateway Intents
   - Enable "Message Content Intent"

### "You don't have permission to use this command"

**Problem:** Permission check failing

**Check:**
1. User has the required role
```javascript
if user has role "Admin":
    reply "Admin access"
```

2. Role name matches exactly (case-sensitive)
3. Bot has permission to manage roles

### Data not persisting

**Problem:** Stored data is lost after restart

**Check:**
1. Using correct store/load syntax
```javascript
# Correct
store user.id points 100
let points = load user.id points or 0
```

2. Data is being stored to correct namespace
3. No errors during store operation

## Common Issues

### Message edits/deletes not working

**Problem:** `edit` or `delete` commands fail

**Solution:** Use message references
```javascript
# Correct
let msg = reply "Checking..."
wait for 2 seconds
edit msg to "Done"

# Wrong
reply "Checking..."
wait for 2 seconds
edit message to "Done"
```

### Rate limiting

**Problem:** Bot hits Discord rate limits

**Symptoms:**
- Commands stop responding
- "Rate limited" errors in logs
- Messages send slowly

**Solutions:**
```javascript
# Add delays between bulk operations
for each item in ["a", "b", "c"]:
    reply "Item: {item}"
    wait for 1 second

# Avoid loops on large collections
# DANGEROUS:
for each member in server.members:
    reply "Hello"
```

### Embeds not displaying

**Problem:** Embed appears as plain text or doesn't show

**Check:**
1. Correct embed syntax
```javascript
reply embed:
    title "Title"
    description "Description"
    color #5865F2
```

2. Bot has embed links permission
3. Color is valid hex code (6 characters with #)

### Buttons not responding

**Problem:** Button clicks don't trigger handlers

**Check:**
1. Button ID matches handler
```javascript
reply with components:
    button "Click me" id "my-button" style "primary"

on button click "my-button":
    reply "Clicked!"
```

2. Button is in a component row
3. Handler is defined after the button

### Modals not showing

**Problem:** Modal doesn't appear when triggered

**Check:**
1. Modal ID matches handler
```javascript
show modal "Form" id "my-modal" with:
    input "Name" id "name" style "short"

on modal submit "my-modal":
    let name = input "name"
    reply "Hello, {name}"
```

2. Interaction context is available
3. Modal has at least one input

## Environment Issues

### DISCORD_TOKEN not found

**Problem:** Error about missing token

**Solution:**
```bash
# Linux/Mac
export DISCORD_TOKEN=your_token_here

# Windows (PowerShell)
$env:DISCORD_TOKEN="your_token_here"

# Windows (CMD)
set DISCORD_TOKEN=your_token_here
```

Or use a `.env` file:
```bash
DISCORD_TOKEN=your_token_here
```

### Port already in use

**Problem:** Another process is using the port

**Solution:**
```bash
# Find and kill the process
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## CLI Issues

### "newt: command not found"

**Problem:** CLI not installed or not in PATH

**Solution:**
```bash
# Install globally
npm install -g @newt-dev/cli

# Or use npx
npx @newt-dev/cli build bot.newt
```

### Build succeeds but bot won't run

**Problem:** Compiled code has runtime errors

**Check:**
1. Install dependencies in dist folder
```bash
cd dist
npm install
DISCORD_TOKEN=your_token npm start
```

2. Check Node.js version (requires Node 18+)
```bash
node --version
```

## Performance Issues

### Bot is slow to respond

**Problem:** Commands take too long to execute

**Solutions:**
1. Reduce unnecessary operations
2. Add caching for frequently accessed data
3. Use async operations properly
4. Check for infinite loops

### Memory usage growing

**Problem:** Bot uses more memory over time

**Solutions:**
1. Clean up old data
2. Avoid storing large objects
3. Use efficient data structures
4. Restart bot periodically if needed

## Getting Help

### Check the logs

Always check the console output for specific error messages. The error message usually points to the exact line and issue.

### Verify syntax

Use the `check` command to validate syntax without building:
```bash
newt check bot.newt
```

### Test incrementally

Test each handler individually:
1. Comment out other handlers
2. Build and test
3. Add handlers back one by one

### Consult documentation

- [Expressions](../reference/expressions.md) - Expression syntax
- [Statements](../reference/statements.md) - Statement syntax
- [Handlers](../reference/handlers.md) - Event handlers
- [Examples](../examples/) - Working examples

### Community support

If you're still stuck:
1. Search existing issues
2. Check the examples for similar patterns
3. Ask for help with specific error messages and code snippets

## Debugging Tips

### Add debug replies

```javascript
on slash "debug":
    reply "User: {user.username}"
    reply "Channel: {channel.name}"
    reply "Server: {server.name}"
```

### Test with simple commands

```javascript
on slash "test":
    reply "Test successful"
```

If this works, the issue is with your specific command logic.

### Check variable values

```javascript
on slash "check":
    let points = load user.id points or 0
    reply "Points: {points}"
```

### Use try-catch for external operations

```javascript
on slash "fetch":
    try:
        let data = fetch "https://api.example.com"
        reply "Success: {data}"
    on error:
        reply "Fetch failed"
```

## Common Mistakes

### Forgetting quotes

```javascript
# Wrong
let x = hello

# Correct
let x = "hello"
```

### Wrong indentation

```javascript
# Wrong
if points > 100:
reply "Level up"

# Correct
if points > 100:
    reply "Level up"
```

### Missing colons

```javascript
# Wrong
if points > 100
    reply "Level up"

# Correct
if points > 100:
    reply "Level up"
```

### Using wrong variable names

```javascript
# Wrong
let points = 100
reply "You have {point} points"

# Correct
let points = 100
reply "You have {points} points"
```

## Next Steps

- [Best Practices](./best-practices.md) - Avoid common issues
- [Migration Guide](./migration-guide.md) - Coming from discord.js
- [Examples](../examples/) - Working reference implementations
