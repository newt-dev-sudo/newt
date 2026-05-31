# Runtime Verification

Last updated: 2026-05-31

This document explains how to verify that generated Newt bots work against real Discord, not only in compiler tests.

## What Can Be Verified Without Discord

From the repo root:

```bash
npm run build
npm run verify:runtime
```

This:

1. Compiles `examples/hello-world.newt`.
2. Writes a generated bot project to `.tmp/runtime-smoke`.
3. Runs `node --check bot.js`.

To also install the generated bot dependencies:

```bash
npm run verify:runtime -- examples/hello-world.newt --install
```

## What Requires Discord

A live runtime test needs:

- A Discord application.
- A bot user.
- A bot token.
- A test Discord server.
- Bot invited to the server.
- Message Content Intent enabled in the Discord developer portal.
- Permissions to send messages, read messages, manage roles, and moderate users depending on the example.

Do not commit the token. Use an environment variable:

```bash
$env:DISCORD_TOKEN="your-token"
npm run verify:runtime -- examples/hello-world.newt --install --run
```

## Minimum Live Test

Use `examples/hello-world.newt`.

Expected behavior:

1. Bot logs in.
2. Bot appears online in the test server.
3. Send `!hello` in a channel the bot can read.
4. Bot replies with `Hey there, ...`.

## Persistence Test

Use `examples/points-bot.newt`.

Expected behavior:

1. Run the bot.
2. Send `!addpoints`.
3. Send `!points`.
4. Stop the bot.
5. Start the bot again.
6. Send `!points`.
7. The previous point value should still be present.

## Current Status

As of this handoff, generated projects can be built and syntax-checked locally. A real Discord live test has not been completed because it requires a real bot token and server access.
