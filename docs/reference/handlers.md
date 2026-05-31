# Event Handlers

Event handlers define how your bot responds to different events in Discord.

## on ready

Runs when your bot starts up and connects to Discord. Perfect for initialization tasks.

```newt
on ready:
    say "Bot is online!" in channel "general"
```

**Use cases:**
- Sending startup announcements
- Initializing database connections
- Setting bot status

## on command

Responds to user commands with the configured prefix.

```newt
on command "hello":
    reply "Hello, {user.username}!"

on command "info":
    reply "This bot runs on Newt!"
```

**Available variables:**
- `user` - The user who sent the command
- `message` - The message object
- `channel` - The channel where the command was sent
- `server` - The server (guild)
- `args` - Command arguments as an array
- `target` - First mentioned user (if any)

## on message contains

Triggers when any message contains specific text.

```newt
on message contains "help":
    reply "Type !commands for help"

on message contains "bug":
    reply "Report bugs in #support"
```

**Use cases:**
- Auto-responses to keywords
- Content moderation
- Help triggers

## on join

Triggers when a new member joins the server.

```newt
on join:
    say "Welcome to the server!" in channel "general"
    give user role "Member"
```

**Available variables:**
- `user` - The user who joined
- `member` - The member object
- `server` - The server

## on leave

Triggers when a member leaves the server.

```newt
on leave:
    say "{user.username} has left." in channel "general"
```

**Use cases:**
- Logging departures
- Cleanup tasks
- Analytics

## on reaction add

Triggers when someone reacts to a message.

```newt
on reaction add "👍":
    reply "Thanks for the thumbs up!"

on reaction add "❌":
    reply "I understand you disagree"
```

**Use cases:**
- Reaction-based commands
- Polls and voting
- Feedback collection

## Multiple Handlers

You can have multiple handlers of the same type:

```newt
on command "hello":
    reply "Hello!"

on command "bye":
    reply "Goodbye!"

on command "help":
    reply "Available: hello, bye, help"
```

## Handler Best Practices

- **Keep handlers focused** - Each handler should do one thing well
- **Use descriptive command names** - Make them easy to remember
- **Add error handling** - Use `try` blocks for operations that might fail
- **Consider rate limits** - Don't spam messages in rapid succession
