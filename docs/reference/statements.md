# Statements

Statements are the actions your bot can take in response to events.

## reply

Sends a reply to the triggering message.

```newt
reply "Your message here"
```

**With variables:**
```newt
reply "Hello, {user.username}!"
```

## say

Sends a message to a specific channel.

```newt
say "Announcement" in channel "announcements"
```

**Use cases:**
- Cross-channel announcements
- Sending to specific channels
- Bot status updates

## say embed

Sends a rich embedded message with formatting.

```newt
say embed:
    title "Welcome!"
    description "Read the rules before posting"
    color #5865F2
    field "Important" "Check #announcements"
```

**Embed properties:**
- `title` - Bold title at the top
- `description` - Main body text
- `color` - Hex color for the left border
- `field` - Named field with value

## let

Declares a variable for use in your handler.

```newt
let points = load user.id points or 0
let userName = user.username
```

**Use cases:**
- Storing intermediate values
- Simplifying complex expressions
- Reusing computed values

## store

Saves a value to persistent storage (SQLite database).

```newt
store user.id points = 100
store server.id welcomeCount = 5
```

**Storage structure:**
- Namespace (e.g., user ID, server ID)
- Key (e.g., "points", "welcomeCount")
- Value (any JSON-serializable data)

## load

Loads a value from persistent storage.

```newt
let points = load user.id points or 0
let count = load server.id welcomeCount or 0
```

**Fallback values:**
Use `or` to provide a default if the key doesn't exist.

## if / else

Conditional logic for branching behavior.

```newt
if user has role "Admin":
    reply "You have admin access"
else:
    reply "Regular user access"
```

**Conditions:**
- `user has role "RoleName"` - Check if user has a role
- `message.content contains "text"` - Check message content
- Comparison operators: `=`, `!=`, `<`, `>`, `<=`, `>=`

## for each

Iterates over server members.

```newt
for each member in server.members:
    say "Hello, {member.user.username}" in channel "general"
```

**Use cases:**
- Mass messages
- Member operations
- Analytics

## give role

Gives a role to a user.

```newt
give user role "Member"
give target role "VIP"
```

## remove role

Removes a role from a user.

```newt
remove user role "Member"
```

## mute

Mutes a user for a duration.

```newt
mute target for 10 minutes
mute user for 1 hour
```

**Duration units:**
- `seconds` / `second`
- `minutes` / `minute`
- `hours` / `hour`
- `days` / `day`

## kick

Kicks a user from the server.

```newt
kick target
```

## ban

Bans a user from the server.

```newt
ban target
```

## wait

Pauses execution for a duration.

```newt
wait 5 seconds
say "This appears 5 seconds later"
```

**Use cases:**
- Rate limiting
- Timed sequences
- Delayed responses
