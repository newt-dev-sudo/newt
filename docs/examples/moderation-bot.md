# Moderation Bot

A moderation bot with content filtering and member management commands.

## Code

```javascript
bot name "ModNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on ready:
    say "ModNewt is watching the server." in channel "moderation"

on message contains "spoiler":
    reply "Please keep spoilers in the spoiler channel."

on command "mute":
    require role "Moderator"
    mute target for 10 minutes
    reply "{target} has been muted for 10 minutes."

on command "kick":
    require role "Moderator"
    kick target
    reply "{target} was kicked."

every 1 hour:
    say "Moderation reminder: be kind and read the rules." in channel "general"

at "09:00" daily:
    say "Good morning! Today's mod queue is ready." in channel "moderation"
```

## What It Does

- Automatically responds to messages containing "spoiler"
- `!mute` - Mutes a user for 10 minutes (Moderator only)
- `!kick` - Kicks a user (Moderator only)
- Hourly moderation reminders
- Daily morning announcements

## Key Concepts

### Content Filtering

```javascript
on message contains "spoiler":
    reply "Please keep spoilers in the spoiler channel."
```

- Triggers on any message containing the text
- Useful for auto-moderation
- Can be used for keyword filtering

### Role Requirements

```javascript
on command "mute":
    require role "Moderator"
    mute target for 10 minutes
```

- Restricts commands to specific roles
- Prevents unauthorized use
- Essential for moderation tools

### Moderation Actions

```javascript
mute target for 10 minutes
kick target
```

- Built-in moderation commands
- Time-based mutes
- Permanent kicks

### Timers

```javascript
every 1 hour:
    say "Reminder" in channel "general"

at "09:00" daily:
    say "Morning announcement" in channel "moderation"
```

- Recurring tasks
- Scheduled messages
- Automated reminders

## How to Run

```bash
newt build moderation-bot.newt --out moderation-bot
cd moderation-bot
npm install
DISCORD_TOKEN="your-token" npm start
```

## Setup Requirements

1. Create a "Moderator" role in your server
2. Give the bot permission to:
   - Manage Roles
   - Kick Members
   - Moderate Members
   - Read Messages
   - Send Messages

## Use Cases

- Content moderation
- Rule enforcement
- Automated reminders
- Community management

## Extensions

- Add warning system before kicks
- Create ban command
- Add reason logging
- Implement strike system
- Add auto-mod for bad words
