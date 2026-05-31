# Bot Configuration

Configure your bot's basic settings at the top of your `.newt` file.

## bot name

Sets your bot's display name. This is used in messages and can help identify your bot.

```newt
bot name "MyAwesomeBot"
```

## bot prefix

Sets the command prefix for your bot. Users will type this before commands.

```newt
bot prefix "!"
```

Common prefixes:
- `!` - Standard
- `/` - Slash-like
- `.` - Minimal
- `>` - Distinct

## bot token

Sets your Discord bot token. **Always use environment variables** for security.

```newt
bot token from env "DISCORD_TOKEN"
```

### Setting up your token

1. Create a Discord application in the [Developer Portal](https://discord.com/developers/applications)
2. Go to the "Bot" tab and click "Add Bot"
3. Copy the token
4. Set it as an environment variable:

**Linux/Mac:**
```bash
export DISCORD_TOKEN="your-token-here"
```

**Windows (PowerShell):**
```powershell
$env:DISCORD_TOKEN="your-token-here"
```

**Windows (CMD):**
```cmd
set DISCORD_TOKEN=your-token-here
```

### Security Best Practices

- **Never commit your token to git**
- **Never share your token publicly**
- **Rotate your token if it's accidentally exposed**
- **Use different tokens for development and production**

See [Token Security](../security.md) for more details.

## Complete Example

```newt
bot name "HelperBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "help":
    reply "Available commands: !hello, !info"
```
