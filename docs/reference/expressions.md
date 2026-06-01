# Expressions

Expressions are the building blocks of your bot's logic. They represent values and computations that your bot uses to make decisions and respond to users.

## What are Expressions?

Think of expressions like variables in math or placeholders in a document. They represent data that your bot can work with - like who sent a message, what channel it was sent in, or how many points a user has.

**Where do you use expressions?**
- In messages: `reply "Hello, {user.username}"`
- In conditions: `if points > 100`
- In calculations: `let newPoints = points + 10`

## Built-in Variables

These are special variables that Newt provides automatically. You don't need to create them - they're always available in your handlers.

### user

**What it is:** The user who triggered the event (sent a command, joined the server, etc.)

**When it's available:** In most event handlers (commands, reactions, etc.)

**What you can do with it:**
```javascript
reply "Hello, {user.username}"
```

**Available properties:**
- `user.username` - The user's display name (what you see in chat)
- `user.id` - A unique number that identifies this user (never changes)
- `user.mention` - A special string that mentions the user (like `@username`)

**Example:**
```javascript
on command "whoami":
    reply "You are {user.username} (ID: {user.id})"
```

**What this does:**
- User types: `!whoami`
- Bot responds: "You are JohnDoe (ID: 123456789)"

### member

**What it is:** The member object, which represents a user in a specific server

**When it's available:** In join/leave events and when working with server-specific data

**Difference from user:** A `user` is the same across all Discord servers, but a `member` is specific to one server (with server-specific roles, nickname, etc.)

```javascript
on join:
    reply "Welcome, {member.user.username}!"
```

### message

**What it is:** The message that triggered your bot

**When it's available:** In command handlers and message contains handlers

**What you can do with it:**
```javascript
reply "You said: {message.content}"
```

**Available properties:**
- `message.content` - The actual text of the message

**Example:**
```javascript
on command "echo":
    reply "You said: {message.content}"
```

**What this does:**
- User types: `!echo hello world`
- Bot responds: "You said: !echo hello world"

### channel

**What it is:** The channel where the event happened

**When it's available:** In most event handlers

**What you can do with it:**
```javascript
say "Announcement" in channel "general"
```

**Available properties:**
- `channel.name` - The name of the channel

**Example:**
```javascript
on command "whereami":
    reply "You are in #{channel.name}"
```

### server

**What it is:** The server (also called a "guild") where the event happened

**When it's available:** In most event handlers

**What you can do with it:**
```javascript
# Safe example - small list
for each item in ["item1", "item2", "item3"]:
    say "Item: {item}"
```

> ⚠️ **Rate Limit Warning:** Never loop through `server.members` and send a message for each member - this will hit Discord's rate limits and get your bot suspended. Only use `for each` with small, known lists.

**Available properties:**
- `server.name` - The name of the server
- `server.members` - All members in the server

**Example:**
```javascript
on command "serverinfo":
    reply "Welcome to {server.name}!"
```

### args

**What it is:** Command arguments - the extra words users type after a command

**When it's available:** In command handlers

**How it works:**
- If user types `!greet John`, then `args[0]` is "John"
- If user types `!greet John Doe`, then `args[0]` is "John" and `args[1]` is "Doe"

```javascript
on command "greet":
    reply "Hello, {args[0]}!"
```

**Understanding array indexing:**
- `args[0]` - First argument (not `args[1]`!)
- `args[1]` - Second argument
- `args[2]` - Third argument
- And so on...

**Why start at 0?** This is how most programming languages work - counting starts at 0 instead of 1.

**Example:**
```javascript
on command "add":
    let sum = args[0] + args[1]
    reply "The sum is {sum}"
```

**What this does:**
- User types: `!add 5 3`
- Bot responds: "The sum is 8"

### target

**What it is:** The first user mentioned in a message

**When it's available:** In command handlers

**How it works:**
- If user types `!kick @JohnDoe`, then `target` is JohnDoe
- Useful for commands that act on other users

```javascript
on command "kick":
    kick target
```

**Example:**
```javascript
on command "ban":
    ban target
    reply "Banned {target.username}"
```

**What this does:**
- User types: `!ban @TrollUser`
- Bot responds: "Banned TrollUser"

## String Interpolation

**What it is:** Embedding variables directly into text strings

**How it works:** Use `{variable}` inside a string to insert the variable's value

```javascript
reply "Hello, {user.username}! You have {points} points."
```

**Why it's useful:** Makes your messages dynamic and personalized

**Example:**
```javascript
on command "status":
    reply "{user.username} has {points} points"
```

**What this does:**
- User types: `!status`
- Bot responds: "JohnDoe has 150 points"

**Multiple variables:**
```javascript
reply "Hello {user.username}! You're in #{channel.name}"
```

## Operators

Operators let you compare values, combine conditions, and do math.

### Comparison Operators

**What they do:** Compare two values to see if they're equal, greater than, etc.

**Available operators:**
- `=` - Equal to
- `!=` - Not equal to
- `<` - Less than
- `>` - Greater than
- `<=` - Less than or equal to
- `>=` - Greater than or equal to

```javascript
if points > 100:
    reply "You have lots of points!"

if level = 10:
    reply "You reached level 10!"
```

**Example:**
```javascript
on command "check":
    if points > 50:
        reply "You have more than 50 points"
    else:
        reply "You have 50 points or less"
```

### Logical Operators

**What they do:** Combine multiple conditions together

**Available operators:**
- `and` - Both conditions must be true
- `or` - Either condition can be true
- `not` - Reverses the condition (true becomes false, false becomes true)

```javascript
if user has role "Admin" or user has role "Mod":
    reply "You have moderation powers"

if points > 100 and user has role "VIP":
    reply "VIP with bonus points!"
```

**Example:**
```javascript
on command "admin":
    if user has role "Admin" and user has role "Owner":
        reply "You are the supreme admin!"
    else if user has role "Admin":
        reply "You are an admin"
    else:
        reply "You are not an admin"
```

### Arithmetic Operators

**What they do:** Do math with numbers

**Available operators:**
- `+` - Addition
- `-` - Subtraction
- `*` - Multiplication
- `/` - Division

```javascript
let newPoints = points + 10
let half = points / 2
let doubled = points * 2
let decreased = points - 5
```

**Example:**
```javascript
on command "addpoints":
    let newTotal = points + args[0]
    store user.id points newTotal
    reply "Added {args[0]} points! Total: {newTotal}"
```

**What this does:**
- User types: `!addpoints 25`
- Bot responds: "Added 25 points! Total: 175"

## Special Expressions

### has

**What it does:** Check if a user has a specific role

**Why it's useful:** For permissions - only let certain users use certain commands

```javascript
if user has role "Admin":
    reply "Admin access granted"
```

**Example:**
```javascript
on command "ban":
    if user has role "Admin":
        ban target
        reply "Banned {target.username}"
    else:
        reply "You don't have permission to ban users"
```

### or (fallback)

**What it does:** Provide a default value if something doesn't exist

**Why it's useful:** Prevents errors when data might be missing

```javascript
let points = load user.id points or 0
```

**How it works:**
- Try to load the user's points
- If they don't have points saved, use 0 instead
- This prevents "undefined" errors

**Example:**
```javascript
on command "points":
    let points = load user.id points or 0
    reply "You have {points} points"
```

**What this does:**
- First time user runs command: They have 0 points (default)
- After earning points: Shows their actual total

## Literals

Literals are fixed values you type directly into your code.

### Strings

**What they are:** Text values

**How to write them:** Wrap text in quotes

```javascript
reply "Hello"
reply 'World'
```

**When to use single vs double quotes:**
- Both work the same way
- Use double quotes by default
- Use single quotes if your text contains double quotes

### Numbers

**What they are:** Numeric values

**How to write them:** Just type the number

```javascript
let count = 42
let price = 19.99
let negative = -5
```

**Types of numbers:**
- Whole numbers: `42`, `100`, `0`
- Decimals: `19.99`, `3.14`, `0.5`
- Negative numbers: `-5`, `-10.5`

### Colors

**What they are:** Hex color codes for embeds

**How to write them:** Start with `#` followed by 6 characters

```javascript
say embed:
    color #5865F2
```

**Common colors:**
- `#5865F2` - Discord blurple
- `#57F287` - Discord green
- `#ED4245` - Discord red
- `#FEE75C` - Discord yellow
- `#EB459E` - Discord pink

## Member Access (Dot Notation)

**What it is:** Accessing properties of an object using dots

**How it works:** `object.property`

```javascript
user.username
message.content
channel.name
server.members
```

**Why it's called "dot notation":** Because you use dots to separate the object from its property

**How to read it:**
- `user.username` = "the username property of the user object"
- `message.content` = "the content property of the message object"

**Nested access:**
```javascript
member.user.username
```

This means: "the username property of the user object, which is a property of the member object"

## getUser

**Concept:** REST API calls and external data fetching

**What it does:** Fetches a user from Discord by their ID

**When to use it:** When you need information about a user who isn't in the current server

**How it works:**
- Takes a user ID (snowflake)
- Returns a user object with properties like username, discriminator, avatar
- Must be used in a try/catch block in case the user doesn't exist

```javascript
getUser(userId)
```

**Example:**
```javascript
on command "userinfo":
    try:
        let userInfo = getUser(target.id)
        reply "User: {userInfo.username}"
    on error:
        reply "Could not fetch user info"
```

**What this does:**
- User types: `!userinfo @someone`
- Bot fetches the user's information from Discord's API
- Bot replies with the username
- If the fetch fails, bot replies with an error message

**Use cases:**
- Looking up users outside the server
- Getting user details for moderation
- Fetching user avatars
- Cross-server user information

**Important notes:**
- Requires the user ID (snowflake)
- Must be wrapped in try/catch
- Can fetch users not in the current server
- Rate limits apply

## getGuild

**Concept:** REST API calls and external data fetching

**What it does:** Fetches a guild (server) from Discord by its ID

**When to use it:** When you need information about a server the bot isn't in

**How it works:**
- Takes a guild ID (snowflake)
- Returns a guild object with properties like name, member count, icon
- Must be used in a try/catch block in case the guild doesn't exist

```javascript
getGuild(guildId)
```

**Example:**
```javascript
on command "guildinfo":
    try:
        let guildInfo = getGuild(server.id)
        reply "Guild: {guildInfo.name}"
    on error:
        reply "Could not fetch guild info"
```

**What this does:**
- User types: `!guildinfo`
- Bot fetches the server's information from Discord's API
- Bot replies with the server name
- If the fetch fails, bot replies with an error message

**Use cases:**
- Looking up server information
- Getting member counts
- Fetching server icons
- Cross-server information

**Important notes:**
- Requires the guild ID (snowflake)
- Must be wrapped in try/catch
- Can fetch servers the bot isn't in
- Rate limits apply

## Common Questions

### What's the difference between `user` and `member`?

- `user` = The person across all of Discord (global)
- `member` = The person in this specific server (with server-specific roles, nickname, etc.)

### Can I create my own variables?

Yes! Use the `let` statement:
```javascript
let myVariable = 42
```

### What if I try to access a property that doesn't exist?

You'll get an error. Make sure you're using valid properties for each object type.

### Can I do complex math?

Yes! You can combine operators:
```javascript
let result = (points + bonus) * multiplier
```

## Next Steps

Now that you understand expressions, learn about:
- [Statements](./statements.md) - How to use expressions in actions
- [Handlers](./handlers.md) - Where expressions are available
- [Bot Configuration](./bot-config.md) - Setting up your bot
