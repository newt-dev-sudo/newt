# Moderation Bot

A moderation bot with content filtering and member management commands.

## Code

```javascript
bot name "ModNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on ready:
    say "ModNewt is watching the server." in channel "moderation"

# Note: This filter is case-sensitive and only catches lowercase "spoiler"
on message contains "spoiler":
    reply "Please keep spoilers in the spoiler channel."

on command "mute":
    if user has role "Moderator":
        mute target for 10 minutes
        reply "{target} has been muted for 10 minutes."
    else:
        reply "You don't have permission to use this command."

on command "kick":
    if user has role "Moderator":
        kick target
        reply "{target} was kicked."
    else:
        reply "You don't have permission to use this command."
```

## What It Does

- Automatically responds to messages containing "spoiler" (case-sensitive)
- `!mute` - Mutes a user for 10 minutes (Moderator only)
- `!kick` - Kicks a user (Moderator only)

## Key Concepts

### Content Filtering

```javascript
on message contains "spoiler":
    reply "Please keep spoilers in the spoiler channel."
```

- Triggers on any message containing the text
- Useful for auto-moderation
- Can be used for keyword filtering
- **Note:** This is case-sensitive and only matches lowercase "spoiler"

### Permission Checks

```javascript
on command "mute":
    if user has role "Moderator":
        mute target for 10 minutes
        reply "{target} has been muted for 10 minutes."
    else:
        reply "You don't have permission to use this command."
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

## How to Run

```bash
newt run moderation-bot.newt
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
- Community management

## Extensions

- Add warning system before kicks
- Create ban command
- Add reason logging
- Implement strike system
- Add auto-mod for bad words
