# Troubleshooting

Common issues and how to fix them.

## Bot Issues

### Bot doesn't respond to commands

**Possible causes:**
- Message Content Intent not enabled
- Bot lacks permissions
- Wrong command prefix
- Bot not in the correct channel

**Solutions:**
1. Enable Message Content Intent in Discord Developer Portal
2. Check bot has "Read Messages" and "Send Messages" permissions
3. Verify your bot prefix matches what you're typing
4. Ensure bot is in the channel you're testing in

### Bot shows "undefined" instead of username

**Cause:** Discord.js v14 uses `user.username` not `user.name`

**Solution:** Newt automatically handles this, but if you see this issue, ensure you're using the latest version:

```bash
npm update -g newt-lang
```

### Bot crashes on startup

**Check:**
- DISCORD_TOKEN environment variable is set
- Token is valid (not expired or revoked)
- Node.js version is 20 or higher

**Debug:**
```bash
DISCORD_TOKEN="your-token" npm start
```

## Build Issues

### "Cannot find module @newt-lang/compiler"

**Cause:** Compiler package not installed

**Solution:**
```bash
npm install -g @newt-lang/compiler
npm install -g newt-lang
```

### "Syntax error" in .newt file

**Common issues:**
- Inconsistent indentation (mix 2 and 4 spaces)
- Missing colons after event handlers
- Unclosed quotes in strings

**Check with:**
```bash
newt check my-bot.newt
```

### "Token not found" error

**Cause:** Token not set as environment variable

**Solution:**
```bash
# Windows PowerShell
$env:DISCORD_TOKEN="your-token"

# Linux/Mac
export DISCORD_TOKEN="your-token"
```

## Installation Issues

### "Permission denied" on global install

**Linux/Mac:**
```bash
sudo npm install -g newt-lang
```

**Windows:**
- Run terminal as Administrator
- Or use a user-local install:
```bash
npm install newt-lang
npx newt check my-bot.newt
```

### "Command not found" after install

**Check npm global bin location:**
```bash
npm config get prefix
```

Add that path to your system PATH, or use npx:
```bash
npx newt check my-bot.newt
```

## Runtime Issues

### Database errors (points-bot)

**Cause:** SQLite database file permissions

**Solution:**
- Ensure bot has write permissions in its directory
- Delete `newt-store.sqlite` and let it recreate
- Check disk space

### Rate limiting errors

**Cause:** Sending messages too quickly

**Solution:**
- Add `wait` statements between messages
- Use `for each` with delays
- Implement rate limiting in your bot logic

### Role management errors

**Cause:** Bot lacks "Manage Roles" permission

**Solution:**
1. Go to Discord Developer Portal
2. Enable "Manage Roles" in bot permissions
3. Re-invite bot to server with new permissions
4. Ensure bot's role is higher than roles it's trying to assign

## Development Issues

### VS Code extension not working

**Solutions:**
1. Reload VS Code window
2. Check extension is installed
3. Ensure file has `.newt` extension
4. Check VS Code version (1.80+ required)

### Hot reload not working

**Cause:** Need to rebuild after code changes

**Solution:**
```bash
newt build my-bot.newt --out my-bot
cd my-bot
npm start
```

## Getting Help

If you're still stuck:

1. Check the [Quickstart Guide](./quickstart.md)
2. Review [Language Reference](./reference/bot-config.md)
3. Look at [Examples](./examples/hello-world.md)
4. Search existing issues on [GitHub](https://github.com/newt-lang/newt/issues)
5. Ask in the [Discord community](https://discord.gg/newt)

## Reporting Bugs

When reporting bugs, include:

- Newt version (`newt --version`)
- Node.js version (`node --version`)
- Operating system
- Your `.newt` file (remove sensitive data)
- Error messages or stack traces
- Steps to reproduce
