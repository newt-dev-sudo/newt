# Token Security

Your Discord bot token is the key to your bot's identity. Protect it carefully.

## What is a Bot Token?

A bot token is a unique identifier that authenticates your bot with Discord's servers. Anyone with your token can control your bot.

## Security Best Practices

### 1. Never Commit Tokens to Git

**❌ WRONG:**
```newt
bot token "MTUxMDM4OTc5NzYwMzI1MDIxNg.Gxsg73..."
```

**✅ CORRECT:**
```newt
bot token from env "DISCORD_TOKEN"
```

### 2. Use Environment Variables

Set your token as an environment variable:

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

### 3. Use .env Files (Development Only)

Create a `.env` file in your project:

```env
DISCORD_TOKEN=your-token-here
```

Add `.env` to your `.gitignore`:

```gitignore
.env
```

Load it in your bot:
```bash
# Using dotenv
npm install dotenv
node -r dotenv/config bot.js
```

### 4. Rotate Compromised Tokens

If your token is accidentally exposed:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to the "Bot" tab
4. Click "Reset Token"
5. Update your environment variable with the new token
6. Restart your bot

### 5. Use Different Tokens for Environments

- **Development:** Separate token for testing
- **Staging:** Separate token for pre-production
- **Production:** Separate token for live deployment

This prevents development mistakes from affecting production bots.

## Common Mistakes

### Sharing Screenshots

Don't share screenshots that show your token in code or terminal output.

### Public Repositories

Never push `.env` files or code with hardcoded tokens to public repositories.

### Chat Messages

Never paste your token in Discord chats, even in private messages.

### Debug Logs

Be careful when logging - don't log your token in error messages or debug output.

## Checking for Leaked Tokens

Use tools to scan your repositories for leaked tokens:

- [GitGuardian](https://www.gitguardian.com/)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- GitHub's secret scanning (automatic for public repos)

## Production Deployment

### Environment Variables in Production

Set environment variables in your hosting platform:

**Heroku:**
```bash
heroku config:set DISCORD_TOKEN=your-token
```

**Railway:**
```bash
railway variables set DISCORD_TOKEN=your-token
```

**Docker:**
```dockerfile
ENV DISCORD_TOKEN=your-token
```

Or use Docker secrets for better security.

### CI/CD Pipelines

Store tokens as secrets in your CI/CD platform:

- **GitHub Actions:** Repository secrets
- **GitLab CI:** Masked variables
- **CircleCI:** Environment variables

## Token Permissions

Only grant your bot the permissions it needs:

- **Message Content Intent** - Only if you need to read message content
- **Server Members Intent** - Only if you use member events
- **Privileged Intents** - Only if absolutely necessary

Fewer permissions = smaller attack surface.

## Monitoring

Monitor your bot for suspicious activity:

- Unexpected commands being executed
- Messages sent to unusual channels
- Rate limit violations
- Login attempts from unusual locations

If you see suspicious activity, rotate your token immediately.

## Summary

- ✅ Always use environment variables
- ✅ Never commit tokens to git
- ✅ Rotate compromised tokens immediately
- ✅ Use different tokens per environment
- ✅ Monitor for suspicious activity
- ❌ Never share tokens publicly
- ❌ Never hardcode tokens in code
