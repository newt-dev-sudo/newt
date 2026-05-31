# Newt

Small script, big bot.

Newt is a beginner-friendly domain-specific language for building Discord bots. It compiles `.newt` files into runnable `discord.js` projects while keeping the authoring experience close to plain English.

```newt
bot name "CoolBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on ready:
    say "CoolBot is online!" in channel "bot-status"

on command "hello":
    reply "Hey there, {user.name}!"
```

## Workspace

- `packages/compiler` - lexer, parser, validator, and code generator
- `packages/cli` - `newt` command-line tool
- `packages/playground` - browser IDE and Discord simulation
- `vscode-newt` - VS Code language support
- `examples` - language coverage examples used by compiler tests
- `docs` - user-facing documentation

## Current Status

This repository is in the Phase 1 foundation scaffold. The first implemented pieces are examples, AST definitions, friendly error types, and the lexer.
