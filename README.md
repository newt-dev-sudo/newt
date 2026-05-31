# Newt

![npm version](https://img.shields.io/npm/v/@newt-dev/cli)
![License](https://img.shields.io/npm/l/@newt-dev/cli)
![Node](https://img.shields.io/node/v/@newt-dev/cli)

**Small script, big bot.**

A beginner-friendly DSL for Discord bots. Write `.newt` files, compile to `discord.js`.

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
DISCORD_TOKEN="your-token" npm start
```

## Features

- Simple, English-like syntax
- Persistent SQLite storage
- Role management & rich embeds
- Timers & scheduled tasks
- Browser playground

## Docs

- [Quickstart](https://github.com/newt-dev-sudo/newt/blob/main/docs/quickstart.md)
- [Reference](https://github.com/newt-dev-sudo/newt/blob/main/docs/reference/bot-config.md)
- [Examples](https://github.com/newt-dev-sudo/newt/blob/main/docs/examples/hello-world.md)
- [Deployment](https://github.com/newt-dev-sudo/newt/blob/main/docs/deployment.md)

## Links

- [GitHub](https://github.com/newt-dev-sudo/newt)
- [npm](https://www.npmjs.com/package/@newt-dev/cli)


