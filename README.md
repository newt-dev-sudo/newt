<div align="center">

# 🦎 Newt

**Small script, big bot.**

![npm version](https://img.shields.io/npm/v/@newt-dev/cli)
![License](https://img.shields.io/npm/l/@newt-dev/cli)
![Node](https://img.shields.io/node/v/@newt-dev/cli)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2)

Newt is a programming language designed specifically for Discord bots. If you use Discord and want to create your own bot but don't know how to code, Newt is for you.

**What is Newt?**
Newt lets you write Discord bots using simple, English-like commands. You don't need to learn JavaScript or complex programming concepts - just write what you want your bot to do in plain language.

</div>

## Why Newt?

- **No programming experience needed** - Write in plain English
- **Learn programming concepts** - Understand how bots work while building them
- **Fast results** - Create a working bot in minutes
- **Real Discord features** - Slash commands, buttons, roles, and more
- **Professional results** - Compiles to production-ready code

## What You Can Build

- 🎮 **Game bots** - Points systems, leaderboards, rewards
- 👋 **Welcome bots** - Auto-role assignment, onboarding flows
- 🔒 **Moderation bots** - Auto-moderation, content filtering
- ⏰ **Scheduled tasks** - Reminders, announcements, recurring jobs
- 📊 **Analytics bots** - Track activity, generate reports

## Installation

```bash
npm install -g @newt-dev/cli
```

## Quick Start

1. **Create a bot file** (`my-bot.newt`):
```newt
bot name "MyBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "hello":
    reply "Hello, {user.username}!"
```

2. **Build your bot**:
```bash
newt build my-bot.newt --out my-bot
cd my-bot && npm install
echo "DISCORD_TOKEN=your-token" > .env
npm start
```

**Note:** The `.env` file stores your Discord token securely. Replace `your-token` with your actual bot token from the Discord Developer Portal.

3. **Use your bot in Discord!**

## Features

- Simple, English-like syntax
- Persistent SQLite storage
- Role management & rich embeds
- Timers & scheduled tasks
- Built-in error handling
- Slash commands support
- Button & select menu interactions
- Conditional logic & loops

## Learning Path

1. **Start here** - [Quickstart Guide](https://github.com/newt-dev-sudo/newt/blob/main/docs/quickstart.md)
2. **Learn the basics** - [Language Reference](https://github.com/newt-dev-sudo/newt/blob/main/docs/reference/bot-config.md)
3. **See examples** - [Example Bots](https://github.com/newt-dev-sudo/newt/blob/main/docs/examples/hello-world.md)
4. **Deploy your bot** - [Deployment Guide](https://github.com/newt-dev-sudo/newt/blob/main/docs/deployment.md)

## Links

- [GitHub](https://github.com/newt-dev-sudo/newt)
- [npm](https://www.npmjs.com/package/@newt-dev/cli)


