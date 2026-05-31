# Hello World Bot

The simplest possible Discord bot in Newt.

## Code

```javascript
bot name "HelloBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "hello":
    reply "Hello, {user.username}!"
```

## What It Does

- Responds to `!hello` with a personalized greeting
- Uses the user's username in the response
- Demonstrates basic command handling

## How to Run

```bash
newt build hello-world.newt --out hello-bot
cd hello-bot
npm install
DISCORD_TOKEN="your-token" npm start
```

## Try It Yourself

1. Copy the code into a file named `hello-world.newt`
2. Build and run the bot
3. Type `!hello` in your Discord server

## Next Steps

- Add more commands
- Try the [Points Bot](./points-bot.md)
- Learn about [Event Handlers](../reference/handlers.md)
