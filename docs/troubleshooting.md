# Troubleshooting

This page helps you solve common problems when working with Newt bots. Issues are organized by symptom to help you find the solution quickly.

## My Bot is Online But Doesn't Respond to Commands

**Symptom:** Your bot shows as online in Discord, but typing commands doesn't trigger any response.

**Possible causes:**
1. **Message Content Intent not enabled**
   - Go to Discord Developer Portal → Your Application → Bot
   - Enable "Message Content Intent" under Privileged Gateway Intents
   - Save and restart your bot

2. **Bot doesn't have permission to read messages**
   - Go to Server Settings → Roles
   - Find your bot's role
   - Enable "Read Messages/View Channels" and "Send Messages" permissions
   - Make sure these are enabled in the specific channel you're testing

3. **Wrong command prefix**
   - Check your bot file: `bot prefix "!"`
   - Make sure you're typing the correct prefix before commands
   - Example: If prefix is `!`, type `!hello` not `hello`

4. **Token is incorrect or expired**
   - Run `newt token` to check if a token is set
   - If not, run `newt token YOUR_BOT_TOKEN` with your actual token
   - Make sure you copied the token correctly from the Developer Portal

## I Get an Error When Running `newt run`

**Symptom:** Running `newt run my-bot.newt` shows an error message.

**Common errors:**

**"newt: command not found"**
- Newt CLI isn't installed
- Run: `npm install -g @newt-dev/cli`
- Verify with: `newt --version`

**"Error: Node.js version too old"**
- Newt requires Node.js 18 or higher
- Check your version: `node --version`
- Download the latest LTS from [nodejs.org](https://nodejs.org)

**"No token is set"**
- You haven't saved your Discord token
- Run: `newt token YOUR_BOT_TOKEN`
- Replace `YOUR_BOT_TOKEN` with your actual bot token

**"Syntax error in .newt file"**
- There's a mistake in your bot code
- Run: `newt check my-bot.newt` for detailed error information
- Common issues:
  - Missing colons after handlers (`on command "hello":`)
  - Wrong indentation (use consistent spaces)
  - Unclosed quotes in strings

## Bot Says "Invalid Token"

**Symptom:** Bot starts but immediately disconnects with an invalid token error.

**Causes:**
1. **Wrong token copied**
   - Go to Discord Developer Portal → Your Application → Bot
   - Click "Reset Token" to generate a new one
   - Copy the new token and run: `newt token YOUR_NEW_TOKEN`

2. **Token has extra spaces or characters**
   - Make sure you copied only the token string
   - No extra spaces, quotes, or newlines

3. **Using client secret instead of bot token**
   - The bot token is under the "Bot" tab
   - The client secret is under "OAuth2" → General
   - Use the bot token, not the client secret

## Commands Work in DM But Not in Server

**Symptom:** Bot responds to commands in DMs but not in your server.

**Causes:**
1. **Bot doesn't have server permissions**
   - Re-invite the bot with proper permissions
   - Go to Developer Portal → OAuth2 → URL Generator
   - Select scopes: `bot`
   - Select permissions: `Send Messages`, `Read Messages/View Channels`
   - Use the generated URL to re-invite

2. **Channel-specific permissions**
   - Check the channel's permission settings
   - Make sure the bot can read and send messages in that specific channel

3. **Bot is in a different server**
   - Make sure you invited the bot to the correct server
   - Check the server's member list to confirm the bot is there

## Bot Can't See Messages

**Symptom:** Bot is online but doesn't react to any messages or commands.

**Causes:**
1. **Intents not enabled**
   - Go to Developer Portal → Your Application → Bot
   - Enable "Message Content Intent"
   - Enable "Server Members Intent" if tracking joins/leaves
   - Save and restart bot

2. **Bot is in a channel it can't access**
   - Check channel permissions
   - Make sure bot has "Read Messages/View Channels" permission

3. **Rate limiting**
   - If you're testing rapidly, Discord may be rate-limiting your bot
   - Wait a few minutes before testing again

## Node.js Version Errors

**Symptom:** Errors about Node.js version being too old or incompatible.

**Solution:**
- Newt requires Node.js 18 or higher
- Check your version: `node --version`
- If it's below 18, download the latest LTS from [nodejs.org](https://nodejs.org)
- After installing, verify: `node --version` should show 18.x or higher

## npm install Fails

**Symptom:** Running `npm install -g @newt-dev/cli` fails with errors.

**Common issues:**

**"Permission denied" (Linux/Mac)**
- Run with sudo: `sudo npm install -g @newt-dev/cli`
- Or configure npm to use a different directory:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  export PATH=~/.npm-global/bin:$PATH
  ```

**"EACCES" error (Windows)**
- Run PowerShell as Administrator
- Then run: `npm install -g @newt-dev/cli`

**"Network timeout" or "ETIMEDOUT"**
- Check your internet connection
- Try again later (npm servers might be down)
- Or use a different npm registry: `npm install -g @newt-dev/cli --registry=https://registry.npmjs.org`

## Bot Joins But Immediately Leaves

**Symptom:** Bot appears in the server for a moment then disappears.

**Causes:**
1. **Bot was kicked/banned**
   - Check server audit logs
   - Make sure no other admin kicked the bot

2. **Token used by another bot**
   - Each bot needs its own unique token
   - Don't reuse tokens across different bot applications

3. **Gateway connection issues**
   - Restart your bot
   - Check your internet connection
   - Discord might be experiencing outages (check [Discord Status](https://status.discord.com))

## Rate Limit Errors

**Symptom:** Bot gets errors about sending messages too fast.

**Causes:**
- Discord limits how many messages a bot can send per second (typically 10 messages/second)
- If you're using loops like `for each`, you might be hitting this limit

**Solutions:**
- Never loop through large collections like `server.members` and send a message for each
- Use small, known lists with `for each`
- Add delays between messages if sending multiple
- See the [Statements Reference](./reference/statements.md) for rate limit warnings

## Environment Variables Not Working

**Symptom:** Bot says it can't find `DISCORD_TOKEN` or other environment variables.

**Causes:**
1. **Using `bot token from env` but token not set**
   - Run: `newt token YOUR_BOT_TOKEN`
   - Or create a `.env` file with: `DISCORD_TOKEN=your-token-here`

2. **Wrong variable name**
   - Check your bot file uses the correct variable name
   - Common: `DISCORD_TOKEN` (all caps, underscore)

3. **Platform-specific syntax**
   - Windows: `set DISCORD_TOKEN=value` or use PowerShell
   - Mac/Linux: `export DISCORD_TOKEN=value`
   - Or use a `.env` file (recommended)

## Bot Commands Show "Unknown Command"

**Symptom:** Bot responds but says it doesn't recognize your commands.

**Causes:**
1. **Typo in command name**
   - Check your bot file: `on command "hello":`
   - Make sure you type exactly `!hello` (or your prefix + command)

2. **Case sensitivity**
   - Command names are case-sensitive
   - If defined as `on command "Hello":`, type `!Hello` not `!hello`

3. **Extra spaces**
   - Don't add extra spaces in the command name
   - Use: `on command "hello":` not `on command " hello ":`

## File Not Found Errors

**Symptom:** `newt run` says it can't find your `.newt` file.

**Causes:**
1. **Wrong file path**
   - Make sure you're in the correct directory
   - Use: `newt run my-bot.newt` (not the full path unless needed)
   - Check the file exists: `ls` (Mac/Linux) or `dir` (Windows)

2. **Wrong file extension**
   - Newt files must end with `.newt`
   - Not `.txt`, `.js`, or anything else

3. **Typo in filename**
   - Check the exact filename: `my-bot.newt` vs `my bot.newt`
   - Filenames are case-sensitive on Mac/Linux

## Database Errors

**Symptom:** Bot has issues with persistent storage (points, etc.)

**Causes:**
- SQLite database file permissions
- Disk space issues
- Database corruption

**Solutions:**
- Ensure bot has write permissions in its directory
- Delete `newt-store.sqlite` and let it recreate
- Check available disk space

## Role Management Errors

**Symptom:** Bot can't give or remove roles.

**Causes:**
- Bot lacks "Manage Roles" permission
- Bot's role is lower than the role it's trying to assign

**Solutions:**
1. Go to Discord Developer Portal
2. Enable "Manage Roles" in bot permissions
3. Re-invite bot to server with new permissions
4. Ensure bot's role is higher than roles it's trying to assign

## VS Code Extension Not Working

**Symptom:** Syntax highlighting or extension features not working.

**Solutions:**
1. Reload VS Code window (Ctrl+Shift+P → "Reload Window")
2. Check extension is installed
3. Ensure file has `.newt` extension
4. Install from the [GitHub release](https://github.com/newt-dev-sudo/newt/releases/tag/v0.1.0)


## Bot's `on ready:` Block Never Runs

**Symptom:** Your bot logs in and shows as online, but any code inside `on ready:` (like startup announcements or setting status) never executes.

**Cause:** This was a bug in `newt run` versions prior to the stabilization release. The interpreter registered the ready handler on the wrong Discord.js event (`"clientReady"` instead of `"ready"`), so the handler was silently never called.

**Solution:** Update to the latest version of `@newt-dev/cli`:
```bash
npm update -g @newt-dev/cli
```

After updating, `on ready:` blocks will fire correctly. No changes to your `.newt` file are needed.

---

## Bot Built with `newt build` Crashes with SyntaxError (and / or operators)

**Symptom:** Running the generated `bot.js` file immediately crashes with:
```
SyntaxError: Unexpected identifier 'and'
```
or
```
SyntaxError: Unexpected identifier 'or'
```

**Cause:** This was a bug in the code generator (`newt build`) where the logical operators `and` and `or` from your `.newt` file were emitted literally into the generated JavaScript. JavaScript uses `&&` and `||` instead.

**Solution:** Update to the latest version:
```bash
npm update -g @newt-dev/cli
```

Then regenerate your bot:
```bash
newt build my-bot.newt
```

The generated `bot.js` will now correctly use `&&` and `||`. Your `.newt` file is unchanged — you still write `and` and `or`.

---

## Generated Bot Says "environment variable X is not set" and Exits

**Symptom:** When you run a bot generated with `newt build`, it immediately prints something like:
```
Error: environment variable DISCORD_TOKEN is not set.
Add it to your environment before running your bot.
```
and exits.

**What this means:** This is intentional and helpful — the generated bot now checks that your token environment variable is set before trying to connect. Previously, a missing token would cause a confusing Discord.js error deep in the startup sequence.

**Solution:** Set the environment variable before running:
```bash
export DISCORD_TOKEN=your_bot_token_here
node bot.js
```

Or on Windows:
```cmd
set DISCORD_TOKEN=your_bot_token_here
node bot.js
```

---

## Still Having Issues?

If you've tried these solutions and still have problems:

1. **Check the error message carefully** - It often tells you exactly what's wrong
2. **Run `newt check`** - This validates your bot file for syntax errors
3. **Ask for help** - Join our [Discord community](https://discord.gg/cXFCVz3VcR)
4. **Search GitHub issues** - Someone might have had the same problem
5. **Create a minimal example** - Test with the simplest possible bot to isolate the issue

## Getting Help

- **Discord Community:** [Join our server](https://discord.gg/cXFCVz3VcR) for real-time help
- **GitHub Issues:** [Report bugs](https://github.com/newt-dev-sudo/newt/issues)
- **Documentation:** Check the [Language Reference](./reference/bot-config.md) for detailed information

## Reporting Bugs

When reporting bugs, include:

- Newt version (`newt --version`)
- Node.js version (`node --version`)
- Operating system
- Your `.newt` file (remove sensitive data)
- Error messages or stack traces
- Steps to reproduce
