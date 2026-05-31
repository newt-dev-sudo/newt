# Bot Configuration

Every Newt bot starts with configuration settings that tell Discord how your bot should behave. Think of this as setting up your bot's identity and permissions.

## What is Bot Configuration?

Bot configuration is like filling out a profile for your bot. It tells Discord:
- What your bot is called
- How users will interact with it
- How to securely connect to Discord

**Where does it go?** At the very top of your `.newt` file, before any event handlers.

## bot name

**What it does:** Sets your bot's display name. This is the name that appears in messages and helps users identify your bot.

**Why it matters:** A clear name helps users know what your bot does and makes it easier to find.

```javascript
bot name "MyAwesomeBot"
```

**Tips for choosing a name:**
- Keep it short and memorable
- Make it relevant to what your bot does
- Avoid special characters or emojis
- Example: "MusicBot", "HelperBot", "GameTracker"

**What happens if you don't set it?** Your bot will use "NewtBot" as a default name.

## bot prefix

**What it does:** Sets the command prefix for your bot. Users type this before commands to tell your bot they're giving it an instruction.

**Why it matters:** The prefix tells Discord "this message is for the bot, not just regular chat."

```javascript
bot prefix "!"
```

**How it works:**
- If your prefix is `!`, users type `!hello` to trigger your hello command
- If your prefix is `.`, users type `.hello` instead
- The prefix is like calling someone's name before talking to them

**Common prefixes and when to use them:**
- `!` - **Standard** - Most bots use this, users expect it
- `/` - **Slash-like** - Mimics Discord's slash commands
- `.` - **Minimal** - Subtle, less intrusive
- `>` - **Distinct** - Clearly stands out from regular chat

**Choosing the right prefix:**
- Pick something that won't conflict with normal conversation
- Avoid common words people might type
- Make it easy to type on any keyboard
- Consider what other bots in your server use

**Example:**
```javascript
bot prefix "!"

on command "hello":
    reply "Hi there!"

# User types: !hello
# Bot responds: Hi there!
```

## bot token

**What it does:** Sets your Discord bot token, which is like a password that lets your bot log into Discord.

**Why it matters:** Without a token, your bot can't connect to Discord. The token proves to Discord that your bot is authorized to run.

**Important:** **Always use environment variables** for security. Never put your token directly in your code.

```javascript
bot token from env "DISCORD_TOKEN"
```

### What is a Bot Token?

A bot token is a special string of characters that Discord generates when you create a bot. Think of it like:
- A password for your bot
- An API key that lets your bot access Discord
- A security credential that proves your bot is legitimate

**What the code does:**
- `bot token` - Tells Newt we're setting the token
- `from env` - Means "read this from an environment variable"
- `"DISCORD_TOKEN"` - The name of the environment variable to read

### Setting Up Your Token

**Step 1: Get your token from Discord**
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Click "Copy Token" (the button with the copy icon)

**Step 2: Store it in a .env file**
Create a file named `.env` in your bot folder and add:
```
DISCORD_TOKEN=your-actual-token-here
```

Replace `your-actual-token-here` with the token you copied.

**Why use a .env file?**
- Keeps your token separate from your code
- Makes it easy to change tokens without editing code
- Prevents accidentally sharing your token in git repositories
- Standard practice for secure configuration

### Security Best Practices

**Never do this:**
```javascript
# BAD - Don't put your token directly in code!
bot token "MTUxMDM4OTc5NzYwMzI1MDIxNg.GaEFc_.abc123"
```

**Always do this:**
```javascript
# GOOD - Read from environment variable
bot token from env "DISCORD_TOKEN"
```

**Why this matters:**
- If you share your code, you don't want to share your token
- If your code is on GitHub, anyone could see your token
- A leaked token lets anyone control your bot
- You can easily rotate (change) a token without editing code

**Other security tips:**
- **Never commit .env files to git** - Add `.env` to your `.gitignore`
- **Never share your token publicly** - Not in screenshots, not in chat
- **Rotate your token if exposed** - If you accidentally share it, generate a new one
- **Use different tokens for dev and production** - Keeps your environments separate

## Putting It All Together

Here's a complete example of bot configuration:

```javascript
bot name "HelperBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "help":
    reply "Available commands: !hello, !info"

on command "hello":
    reply "Hello, {user.username}!"
```

**What this does:**
1. Names the bot "HelperBot"
2. Sets the command prefix to `!`
3. Reads the token from the DISCORD_TOKEN environment variable
4. Defines two commands: `!help` and `!hello`

**How users interact with it:**
- User types: `!hello`
- Bot responds: "Hello, [username]!"
- User types: `!help`
- Bot responds: "Available commands: !hello, !info"

## Common Questions

### Can I change the prefix later?

Yes! Just change the `bot prefix` line and rebuild your bot. Users will need to use the new prefix after you restart the bot.

### What if I forget my token?

Go back to the Discord Developer Portal and click "Reset Token" to generate a new one. Update your `.env` file with the new token.

### Can I have multiple bots with the same name?

Technically yes, but it's confusing. Give each bot a unique name so you can tell them apart.

### Do I need to set all three configurations?

You need `bot token` for your bot to work. `bot name` and `bot prefix` have defaults if you don't set them, but it's better to set them explicitly.

## Next Steps

Now that your bot is configured, learn about:
- [Event Handlers](./handlers.md) - How your bot responds to events
- [Statements](./statements.md) - What your bot can do
- [Expressions](./expressions.md) - How to work with data
