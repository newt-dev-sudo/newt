<div align="center">

# 🦎 Newt

**Small script, big bot.**

![npm version](https://img.shields.io/npm/v/@newt-dev/cli)
![License](https://img.shields.io/npm/l/@newt-dev/cli)
![Node](https://img.shields.io/node/v/@newt-dev/cli)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2)

A beginner-friendly DSL for Discord bots. Write `.newt` files, compile to `discord.js`.

</div>

## Why Newt?

- **No JavaScript required** - Focus on bot logic, not boilerplate
- **English-like syntax** - Readable and maintainable
- **Production-ready** - Compiles to battle-tested discord.js
- **Fast development** - Build bots in minutes, not hours

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

```newt
bot name "MyBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "hello":
    reply "Hello, {user.username}!"
```

```bash
newt build my-bot.newt --out my-bot
cd my-bot && npm install
echo "DISCORD_TOKEN=your-token" > .env
npm start
```

## Features

- Simple, English-like syntax
- Persistent SQLite storage
- Role management & rich embeds
- Timers & scheduled tasks
- Built-in error handling

## Docs

- [Quickstart](https://github.com/newt-dev-sudo/newt/blob/main/docs/quickstart.md)
- [Reference](https://github.com/newt-dev-sudo/newt/blob/main/docs/reference/bot-config.md)
- [Examples](https://github.com/newt-dev-sudo/newt/blob/main/docs/examples/hello-world.md)
- [Deployment](https://github.com/newt-dev-sudo/newt/blob/main/docs/deployment.md)

## Links

- [GitHub](https://github.com/newt-dev-sudo/newt)
- [npm](https://www.npmjs.com/package/@newt-dev/cli)


