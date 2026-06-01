# Quickstart Guide

Welcome to Newt! This guide will help you create your first Discord bot, even if you've never written code before.

## What is a Discord Bot?

A Discord bot is like an automated user that can respond to messages, perform actions, and interact with your server. Think of it as a custom assistant that follows rules you define.

## What is Newt?

Newt is a programming language designed specifically for Discord bots. Instead of writing complex code, you write simple instructions in plain English that Newt understands.

## Prerequisites

- **Node.js 20 or higher** - This is a tool that runs your bot (download from [nodejs.org](https://nodejs.org))
- **A Discord account** - You probably already have this!
- **A Discord server** - Where you'll test your bot

## Step 1: Install Newt

Newt is a tool that converts your bot instructions into actual code. Install it once:

```bash
npm install -g @newt-dev/cli
```

**What this does:** Downloads the Newt tool to your computer so you can use it anywhere.

## Step 2: Create a Discord Bot Application

Before writing code, you need to register your bot with Discord:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** and give it a name (like "MyFirstBot")
3. Go to the **"Bot"** tab and click **"Add Bot"**
4. Copy your **bot token** (keep this secret - it's like your bot's password)
5. Enable **"Message Content Intent"** under Privileged Gateway Intents
6. Enable **"Server Members Intent"** if you want your bot to track who joins/leaves

**Why this matters:** Discord needs to know about your bot before it can connect. The token is like a key that lets your bot log in.

## Step 3: Invite Your Bot to Your Server

1. Go to the **"OAuth2"** tab in the Developer Portal
2. Under **"OAuth2 URL Generator"**, select:
   - **Scopes:** `bot`
   - **Bot Permissions:** `Send Messages`, `Read Messages/View Channels`, `Manage Roles` (optional)
3. Copy the generated URL and open it in your browser
4. Select your server and authorize the bot

**What this does:** Gives your bot permission to join and act in your server.

## Step 4: Write Your First Bot

Create a file named `my-bot.newt` and add this code:

```javascript
bot name "MyFirstBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on ready:
    say "MyFirstBot is online!" in channel "general"

on command "hello":
    reply "Hey there, {user.username}!"
```

**Let's break this down:**

- `bot name "MyFirstBot"` - Names your bot
- `bot prefix "!"` - Sets the command prefix (so commands start with `!`)
- `bot token from env "DISCORD_TOKEN"` - Tells the bot to use your token from environment variables (safer than hardcoding)
- `on ready:` - What happens when the bot starts up
- `on command "hello":` - What happens when someone types `!hello`
- `reply "Hey there, {user.username}!"` - Responds with a personalized message

**Programming concepts you just learned:**
- **Event handlers** - Code that runs when something happens (like a command or bot startup)
- **Variables** - `{user.username}` is a placeholder that gets replaced with the actual username
- **Indentation** - The spaces at the start of lines show which code belongs to which handler

## Step 5: Save Your Token

> ⚠️ **Security Warning:** Your terminal saves command history. If you're streaming or sharing your screen, your token might be visible in your terminal history. Consider using the Discord token store instead. Learn more in [Token Security](./security.md).

Save your Discord bot token so Newt can use it:

```bash
newt token YOUR_BOT_TOKEN
```

**What this does:**
- Stores your token securely in Newt's configuration
- You only need to do this once
- Newt will automatically use this token when running bots

**Important:**
- Replace `YOUR_BOT_TOKEN` with the actual token you copied from the Discord Developer Portal
- Don't share this token with anyone - it's like your bot's password
- You can clear the token later with `newt token --clear`

## Step 6: Run Your Bot

Now start your bot:

```bash
newt run my-bot.newt
```

**What this does:**
- Reads your Newt code
- Executes it directly (no compilation needed)
- Connects to Discord using your saved token
- Your bot comes online!

**You should see:**
```
Logged in as YourBot#1234!
```

If you see this, your bot is running successfully!

## Step 7: Test Your Bot

Go to your Discord server and type `!hello`. Your bot should reply with "Hey there, [your username]!"

**Congratulations!** You just created your first Discord bot with Newt!

## Next Steps

Now that you have a working bot, here's what you can learn next:

- **Learn more commands** - [Language Reference](./reference/bot-config.md)
- **See example bots** - [Examples](./examples/hello-world.md)
- **Deploy your bot** - [Deployment Guide](./deployment.md)
- **Keep your bot secure** - [Token Security](./security.md)

## Common Questions

### What if my bot doesn't respond?

- Make sure **Message Content Intent** is enabled in the Developer Portal
- Check that the bot has permission to read and send messages in the channel
- Verify your `DISCORD_TOKEN` is set correctly in the `.env` file

### What if I get build errors?

- Run `newt check` to see detailed error messages
- Make sure your indentation is consistent (use 2 or 4 spaces, don't mix them)
- Check that you have the right number of spaces before each line

### What is Node.js and why do I need it?

Node.js is a program that runs JavaScript code outside of a web browser. Your bot needs it to run on your computer or server.

### Can I host my bot online?

Yes! After you build your bot, you can host it on services like:
- [Replit](https://replit.com) (free, easy)
- [Railway](https://railway.app) (simple deployment)
- [Render](https://render.com) (free tier available)

See the [Deployment Guide](./deployment.md) for details.
