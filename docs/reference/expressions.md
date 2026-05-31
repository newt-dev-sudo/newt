# Expressions

Expressions are values and computations you can use in statements.

## Variables

### user

The user who triggered the event.

```newt
reply "Hello, {user.username}"
```

**Available properties:**
- `user.username` - Display name
- `user.id` - Unique ID
- `user.mention` - Mention string

### member

The member object (in join/leave events).

```newt
on join:
    reply "Welcome, {member.user.username}"
```

### message

The message object.

```newt
reply "You said: {message.content}"
```

### channel

The channel where the event occurred.

```newt
say "Announcement" in channel "general"
```

### server

The server (guild) object.

```newt
for each member in server.members:
    say "Hello" in channel "general"
```

### args

Command arguments as an array.

```newt
on command "greet":
    reply "Hello, {args[0]}!"
```

**Usage:**
- `args[0]` - First argument
- `args[1]` - Second argument
- etc.

### target

First mentioned user in the message.

```newt
on command "kick":
    kick target
```

## String Interpolation

Embed variables directly in strings using `{}`.

```newt
reply "Hello, {user.username}! You have {points} points."
```

## Operators

### Comparison

```newt
if points > 100:
    reply "You have lots of points!"
```

**Available:**
- `=` - Equal
- `!=` - Not equal
- `<` - Less than
- `>` - Greater than
- `<=` - Less than or equal
- `>=` - Greater than or equal

### Logical

```newt
if user has role "Admin" or user has role "Mod":
    reply "You have moderation powers"
```

**Available:**
- `and` - Both conditions true
- `or` - Either condition true
- `not` - Negates a condition

### Arithmetic

```newt
let newPoints = points + 10
let half = points / 2
```

**Available:**
- `+` - Addition
- `-` - Subtraction
- `*` - Multiplication
- `/` - Division

## Special Expressions

### has

Check if a user has a role.

```newt
if user has role "Admin":
    reply "Admin access granted"
```

### or (fallback)

Provide a default value if something is undefined.

```newt
let points = load user.id points or 0
```

## Literals

### Strings

```newt
reply "Hello"
reply 'World'
```

### Numbers

```newt
let count = 42
let price = 19.99
```

### Colors

```newt
say embed:
    color #5865F2
```

## Member Access

Access nested properties using dot notation.

```newt
user.username
message.content
channel.name
server.members
```
