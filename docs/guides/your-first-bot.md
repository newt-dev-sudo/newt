# Your First Bot

This guide will walk you through creating your first Discord bot using Newt.

## Prerequisites

Before you begin, make sure you have:
- Node.js installed (version 16 or higher)
- A Discord account
- A Discord application created with a bot token

## Step 1: Install Newt

```bash
npm install -g @newt-dev/cli
```

## Step 2: Create Your Bot File

Create a new file called `bot.newt`:

```newt
bot name "My First Bot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "hello":
    reply "Hello, {user.username}!"
```

## Step 3: Set Your Token

Set your Discord bot token as an environment variable:

```bash
# On Windows
set DISCORD_TOKEN=your_bot_token_here

# On macOS/Linux
export DISCORD_TOKEN=your_bot_token_here
```

## Step 4: Run Your Bot

```bash
newt run bot.newt
```

## Step 5: Test Your Bot

Go to your Discord server and type `!hello`. Your bot should reply with "Hello, [your username]!"

## What's Next?

- Learn about [variables and expressions](../reference/expressions.md)
- Explore [handlers](../reference/handlers.md) for different events
- Check out [examples](../examples/) for more complex bots
