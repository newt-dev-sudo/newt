# Newt

**Small script, big bot.**

Newt is a beginner-friendly domain-specific language for building Discord bots. Write simple `.newt` files that read like plain English, and Newt compiles them into production-ready `discord.js` JavaScript.

## Why Newt?

- **Simple syntax** - Read like English, write like a pro
- **No JavaScript required** - Focus on bot logic, not boilerplate
- **Instant feedback** - Browser playground with live simulation
- **Production ready** - Compiles to battle-tested discord.js

## Quick Example

```newt
bot name "MyBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "hello":
    reply "Hey there, {user.username}!"
```

## Get Started

[Quickstart Guide →](./quickstart.md)

## Features

- 🎯 **Event handlers** - Commands, joins, reactions, and more
- 💾 **Persistent storage** - Built-in SQLite database
- 🔐 **Role management** - Give, remove, and check roles
- 🎨 **Rich embeds** - Beautiful formatted messages
- ⏰ **Timers** - Schedule recurring tasks
- 🧪 **Playground** - Try it in your browser

## Community

- [GitHub](https://github.com/newt-lang/newt)
- [Discord](https://discord.gg/newt)
- [Playground](https://newt-lang.dev)
