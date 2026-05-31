# Quickstart Guide

Get your first Discord bot running in 5 minutes with Newt.

## Prerequisites

- Node.js 20 or higher
- A Discord account
- A Discord server where you can add bots

## Step 1: Install Newt

```bash
npm install -g newt-lang
```

## Step 2: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Copy your bot token (you'll need this later)
5. Enable "Message Content Intent" under Privileged Gateway Intents
6. Enable "Server Members Intent" if your bot uses member events

## Step 3: Invite Your Bot to a Server

1. Go to the "OAuth2" tab in the Developer Portal
2. Under "OAuth2 URL Generator", select:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Read Messages/View Channels`, `Manage Roles` (if needed)
3. Copy the generated URL and open it in your browser
4. Select your server and authorize the bot

## Step 4: Write Your First Bot

Create a file named `my-bot.newt`:

```newt
bot name "MyFirstBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on ready:
    say "MyFirstBot is online!" in channel "general"

on command "hello":
    reply "Hey there, {user.username}!"
```

## Step 5: Build and Run Your Bot

```bash
# Check your code for errors
newt check my-bot.newt

# Build the bot
newt build my-bot.newt --out my-bot

# Install dependencies
cd my-bot
npm install

# Run your bot (set your token as environment variable)
DISCORD_TOKEN="your-bot-token-here" npm start
```

## Step 6: Test Your Bot

Go to your Discord server and type `!hello`. Your bot should reply!

## Next Steps

- Explore the [Language Reference](./reference/bot-config.md) for more commands
- Check out the [Examples](./examples/hello-world.md) for common bot patterns
- Learn about [Token Security](./security.md) for safe bot deployment

## Troubleshooting

### Bot doesn't respond

- Make sure Message Content Intent is enabled in the Developer Portal
- Check that the bot has permission to read and send messages in the channel
- Verify your DISCORD_TOKEN is set correctly

### Build errors

- Run `newt check` to see detailed error messages
- Check that your indentation is consistent (2 or 4 spaces)

### Dependencies fail to install

- Ensure you're running Node.js 20 or higher
- Try deleting `node_modules` and running `npm install` again
