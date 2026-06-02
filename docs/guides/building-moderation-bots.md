# Building Moderation Bots

Learn how to create bots for server moderation with role management, timeouts, and more.

## Basic Moderation Commands

### Mute/Timeout

```newt
on command "mute":
    mute target for 10 minutes
    reply "Muted {target.username} for 10 minutes"

on command "unmute":
    unmute target
    reply "Unmuted {target.username}"
```

### Kick and Ban

```newt
on command "kick":
    kick target
    reply "Kicked {target.username}"

on command "ban":
    ban target
    reply "Banned {target.username}"

on command "unban":
    unban target
    reply "Unbanned {target.username}"
```

## Role Management

### Give and Remove Roles

```newt
on command "giverole":
    give target role "Member"
    reply "Gave Member role to {target.username}"

on command "removerole":
    remove target role "Member"
    reply "Removed Member role from {target.username}"
```

### Role-Based Commands

Use `require role` to restrict commands to specific roles:

```newt
on command "adminonly":
    require role "Admin"
    reply "This is an admin-only command"
```

## Advanced Moderation

### Warning System with Storage

```newt
on command "warn":
    let warnings = load target.id warnings or 0
    let newwarnings = warnings + 1
    store target.id warnings = newwarnings
    reply "Warning {newwarnings}/3 issued to {target.username}"
    
    if newwarnings >= 3:
        mute target for 1 hour
        reply "User muted for 1 hour due to 3 warnings"
```

### Auto-Moderation

```newt
on message contains "badword":
    delete message
    reply "Please watch your language"
    add reaction message "⚠️"
```

## Message Management

### Delete Messages

```newt
on command "clear":
    delete message
    reply "Message deleted"
```

### Edit Messages

```newt
on command "edit":
    reply "Original message"
    wait for 1 second
    edit message to "Edited message"
```

### Pin Messages

```newt
on command "pin":
    pin message
    reply "Message pinned"

on command "unpin":
    unpin message
    reply "Message unpinned"
```

## Complete Moderation Bot Example

```newt
bot name "ModeratorBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

# Mute command
on command "mute":
    require role "Moderator"
    mute target for 10 minutes
    reply "Muted {target.username} for 10 minutes"

# Unmute command
on command "unmute":
    require role "Moderator"
    unmute target
    reply "Unmuted {target.username}"

# Kick command
on command "kick":
    require role "Moderator"
    kick target
    reply "Kicked {target.username}"

# Ban command
on command "ban":
    require role "Admin"
    ban target
    reply "Banned {target.username}"

# Warn command
on command "warn":
    require role "Moderator"
    let warnings = load target.id warnings or 0
    let newwarnings = warnings + 1
    store target.id warnings = newwarnings
    reply "Warning {newwarnings}/3 issued to {target.username}"
    
    if newwarnings >= 3:
        mute target for 1 hour
        reply "User muted for 1 hour due to 3 warnings"

# Clear warnings
on command "clearwarns":
    require role "Moderator"
    store target.id warnings = 0
    reply "Cleared warnings for {target.username}"
```

## Best Practices

- **Always use role requirements**: Restrict moderation commands to trusted roles
- **Log actions**: Store moderation actions for audit trails
- **Provide feedback**: Always confirm actions to the user
- **Be fair**: Implement consistent rules and warnings
- **Test carefully**: Test moderation commands in a safe environment first

## Related Documentation

- [Statements Reference](../reference/statements.md) - Moderation statements
- [Handlers Reference](../reference/handlers.md) - Event handlers
- [Expressions Reference](../reference/expressions.md) - Variables and storage
