# Best Practices Guide

This guide covers best practices for writing clean, maintainable, and efficient Newt bots.

## Bot Structure

### Organize Your Handlers

Group related handlers together and use clear, descriptive names:

```javascript
# User commands
on slash "profile":
    reply "Profile: {user.username}"

on slash "settings":
    reply "Settings"

# Moderation commands
on slash "warn":
    reply "Warning issued"

on slash "mute":
    mute target for 10 minutes
    reply "User muted"
```

### Use Descriptive Variable Names

Choose names that clearly indicate purpose:

```javascript
# Good
let userPoints = load user.id points or 0
let ticketChannel = channel named "ticket-channel"

# Avoid
let x = load user.id points or 0
let c = channel named "ticket-channel"
```

## Slash Commands vs. Prefix Commands

**Prefer slash commands** for user-facing features:

```javascript
# Recommended
on slash "help":
    reply "Help information"

# Use prefix only for debugging/admin
on command "debug":
    reply "Debug info"
```

Slash commands provide:
- Better discoverability
- Built-in validation
- Mobile-friendly interface
- Future-proofing

## Error Handling

### Use Try-Catch for External Operations

```javascript
on slash "userinfo":
    try:
        let userInfo = getUser(target.id)
        reply "User: {userInfo.username}"
    on error:
        reply "Could not fetch user info"
```

### Provide Fallback Values

```javascript
# Good
let points = load user.id points or 0

# Avoid (may cause errors)
let points = load user.id points
```

## Rate Limiting

### Avoid Loops on Large Collections

```javascript
# DANGEROUS - Will hit rate limits
for each member in server.members:
    dm member send "Hello!"

# SAFE - Small, known list
for each item in ["user1", "user2", "user3"]:
    reply "Item: {item}"
```

### Use Delays for Bulk Operations

```javascript
on slash "announce":
    let channels = ["general", "announcements", "rules"]
    for each channelName in channels:
        let targetChannel = channel named channelName
        say "Important announcement!" in channel targetChannel
        wait for 1 second
```

## Data Management

### Use Namespaces for Data Storage

```javascript
# Good - Organized
store user.id points 100
store user.id level 5
store user.id lastSeen "2024-01-01"

# Avoid - Mixed data
store user.id 100
store level 5
```

### Clean Up Old Data

```javascript
on slash "cleanup":
    # Remove old data after 30 days
    let lastSeen = load user.id lastSeen or 0
    if lastSeen < 30 days ago:
        delete key user.id
```

## Security

### Check Permissions Before Actions

```javascript
on slash "ban":
    if user has role "Admin":
        ban target
        reply "User banned"
    else:
        reply "You don't have permission to ban users"
```

### Validate User Input

```javascript
on slash "kick":
    if target:
        kick target
        reply "User kicked"
    else:
        reply "Please mention a user to kick"
```

### Never Hardcode Sensitive Data

```javascript
# Good
bot token from env "DISCORD_TOKEN"

# AVOID
bot token "MTIzNDU2Nzg5MDEyMzQ1Njc4OQ=="
```

## Performance

### Use Built-in Find Functions

```javascript
# Good - Optimized
let adminRole = role named "Admin"
let generalChannel = channel named "general"

# Avoid - Manual iteration
let adminRole = server.roles.find(r => r.name === "Admin")
```

### Cache Frequently Accessed Data

```javascript
on ready:
    let adminRole = role named "Admin"
    store server adminRole adminRole

on slash "admin":
    let adminRole = load server adminRole
    if user has role adminRole:
        reply "Admin access granted"
```

## User Experience

### Provide Clear Feedback

```javascript
# Good
on slash "mute":
    mute target for 10 minutes
    reply "{target.username} has been muted for 10 minutes"

# Avoid
on slash "mute":
    mute target for 10 minutes
```

### Use Ephemeral Replies for Sensitive Info

```javascript
on slash "token":
    reply ephemeral "Your secret token: xyz123"
```

### Format Messages for Readability

```javascript
# Good
on slash "stats":
    reply embed:
        title "Server Statistics"
        description "Current server stats"
        field "Members" "{server.memberCount}"
        field "Channels" "{server.channels.cache.size}"
        color #5865F2

# Avoid
on slash "stats":
    reply "Members: {server.memberCount} Channels: {server.channels.cache.size}"
```

## Testing

### Test Incrementally

1. Build after each major change
2. Test each handler individually
3. Test edge cases (empty input, missing permissions, etc.)

### Use Temporary Test Commands

```javascript
on slash "test":
    reply "Test successful"

on slash "debug":
    reply "Debug: {user.id}"
```

Remove these before production deployment.

## Code Style

### Follow Natural English Patterns

```javascript
# Good - Natural
if user has role "Admin":
    reply "Admin access"

# Avoid - Unnatural
if "Admin" in user.roles:
    reply "Admin access"
```

### Keep Handlers Focused

```javascript
# Good - Single responsibility
on slash "warn":
    let warnings = load target.id warnings or 0
    store target.id warnings warnings + 1
    reply "User warned"

# Avoid - Multiple responsibilities
on slash "warn":
    let warnings = load target.id warnings or 0
    store target.id warnings warnings + 1
    reply "User warned"
    # Also logs to external API
    # Also sends DM
    # Also updates database
```

## Documentation

### Comment Complex Logic

```javascript
on slash "calculate":
    # Calculate level based on points
    # Level formula: floor(points / 100)
    let points = load user.id points or 0
    let level = floor of (points / 100)
    reply "Level: {level}"
```

### Use Descriptive Handler Names

```javascript
# Good
on slash "user-profile-settings":
    reply "Settings"

# Avoid
on slash "ups":
    reply "Settings"
```

## Deployment

### Use Environment Variables

```javascript
bot token from env "DISCORD_TOKEN"
```

Set in production:
```bash
export DISCORD_TOKEN=your_token
npm start
```

### Test in Development First

1. Use a test server
2. Test with a test bot token
3. Verify all commands work
4. Check rate limits
5. Deploy to production

## Common Pitfalls

### Forgetting to Reply

```javascript
# Bad - No feedback
on slash "mute":
    mute target for 10 minutes

# Good - User knows what happened
on slash "mute":
    mute target for 10 minutes
    reply "{target.username} muted for 10 minutes"
```

### Not Handling Errors

```javascript
# Bad - Will crash on API failure
on slash "fetch":
    let data = fetch "https://api.example.com/data"
    reply "Data: {data}"

# Good - Graceful error handling
on slash "fetch":
    try:
        let data = fetch "https://api.example.com/data"
        reply "Data: {data}"
    on error:
        reply "Failed to fetch data"
```

### Ignoring Rate Limits

```javascript
# Bad - Will hit rate limits
for each item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
    reply "Item: {item}"

# Good - Respects rate limits
for each item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
    reply "Item: {item}"
    wait for 1 second
```

## Next Steps

- [Migration Guide](./migration-guide.md) - Coming from discord.js?
- [Your First Bot](./your-first-bot.md) - Getting started
- [Examples](../examples/) - Real-world implementations
