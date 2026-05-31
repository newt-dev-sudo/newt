# Welcome Bot

Automatically welcomes new members and assigns roles.

## Code

```newt
bot name "WelcomeNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on join:
    give user role "Member"
    say embed:
        title "Welcome, {user.username}!"
        description "Read #rules first, then say hello in #general."
        color #5865F2
        field "Starter role" "I gave you the Member role."

on command "role":
    if user has role "Member":
        reply "You already have the Member role!"
    else:
        give user role "Member"
        reply "Done! Role given."

on leave:
    say "{user.username} left the server. We'll miss them!" in channel "general"
```

## What It Does

- Automatically gives new members a "Member" role
- Sends a welcome embed with server information
- Allows users to request the Member role via `!role`
- Announces when members leave the server

## Key Concepts

### Role Management

```newt
give user role "Member"
```

- Assigns roles to users
- Useful for onboarding workflows

### Rich Embeds

```newt
say embed:
    title "Welcome, {user.username}!"
    description "Read #rules first, then say hello in #general."
    color #5865F2
    field "Starter role" "I gave you the Member role."
```

- Creates visually appealing messages
- Supports titles, descriptions, colors, and fields
- Great for announcements and important info

### Conditional Logic

```newt
if user has role "Member":
    reply "You already have the Member role!"
else:
    give user role "Member"
    reply "Done! Role given."
```

- Checks if user already has a role
- Prevents duplicate role assignments
- Provides feedback to users

## How to Run

```bash
newt build welcome-bot.newt --out welcome-bot
cd welcome-bot
npm install
DISCORD_TOKEN="your-token" npm start
```

## Use Cases

- Community onboarding
- Automatic role assignment
- Welcome messages
- Member tracking

## Extensions

- Add different welcome messages for different roles
- Create a rules quiz before granting roles
- Send welcome DMs instead of channel messages
- Track join analytics
