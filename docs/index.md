# Newt

**Small script, big bot.**

Newt is a programming language designed specifically for Discord bots. If you use Discord and want to create your own bot but don't know how to code, Newt is for you.

## What is Newt?

Newt lets you write Discord bots using simple, English-like commands. You don't need to learn JavaScript or complex programming concepts. Just write what you want your bot to do in plain language.

**Example:**
```javascript
bot name "MyBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "hello":
    reply "Hey there, {user.username}!"
```

This creates a bot that responds to `!hello` with a personalized greeting.

## Why Newt?

- **No programming experience needed** - Write in plain English
- **Learn programming concepts** - Understand how bots work while building them
- **Fast results** - Create a working bot in minutes
- **Real Discord features** - Slash commands, buttons, roles, and more
- **Professional results** - Compiles to production-ready code

## What Can You Build?

- 🎮 **Game bots** - Points systems, leaderboards, rewards
- 👋 **Welcome bots** - Auto-role assignment, onboarding flows
- 🔒 **Moderation bots** - Auto-moderation, content filtering
- ⏰ **Scheduled tasks** - Reminders, announcements, recurring jobs
- 📊 **Analytics bots** - Track activity, generate reports

## Get Started

[Quickstart Guide →](./quickstart.md)

**Note:** Newt uses `.env` files to securely store your Discord token. The quickstart guide explains how to set this up step by step.

## Features

- 🎯 **Event handlers** - Commands, joins, reactions, and more
- 💾 **Persistent storage** - Built-in SQLite database
- 🔐 **Role management** - Give, remove, and check roles
- 🎨 **Rich embeds** - Beautiful formatted messages
- ⏰ **Timers** - Schedule recurring tasks
- 🚀 **Slash commands** - Modern Discord command system
- 🔘 **Buttons & menus** - Interactive message components
- 🔀 **Conditional logic** - If/else statements
- 🔄 **Loops** - For each operations

## Learning Path

1. **Start here** - [Quickstart Guide](./quickstart.md)
2. **Learn the basics** - [Language Reference](./reference/bot-config.md)
3. **See examples** - [Example Bots](./examples/hello-world.md)
4. **Deploy your bot** - [Deployment Guide](./deployment.md)

## Community

- [GitHub](https://github.com/newt-dev-sudo/newt)
- [npm](https://www.npmjs.com/package/@newt-dev/cli)
