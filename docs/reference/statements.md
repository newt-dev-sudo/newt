# Statements

Statements are the actions your bot can take. While handlers define **when** your bot responds, statements define **what** your bot does in response.

## What are Statements?

Think of statements like actions or commands. If handlers are "when X happens," then statements are "do Y."

**Example:**
- Handler: "When someone says !hello"
- Statement: "Reply with 'Hi there!'"

**How they work:**
- Statements go inside handlers
- Each statement does one specific thing
- Statements run in order, from top to bottom
- You can have multiple statements in one handler

## reply

**Concept:** Side effects and output

**What it does:** Sends a reply to the message that triggered the handler

**When to use it:** When you want your bot to respond directly to a user's message

**How it works:**
- The reply appears in the same channel as the original message
- It's linked to the original message (shows as a reply in Discord)
- Other users can see the reply

```javascript
reply "Your message here"
```

**With variables:**
```javascript
reply "Hello, {user.username}!"
```

**Example:**
```javascript
on command "hello":
    reply "Hi there, {user.username}!"
```

**What this does:**
- User types: `!hello`
- Bot replies: "Hi there, JohnDoe!" (in the same channel)

**Use cases:**
- Responding to commands
- Acknowledging user actions
- Providing feedback
- Answering questions

**Difference from `say`:**
- `reply` - Responds to the triggering message (same channel)
- `say` - Sends to any channel you specify

## say

**Concept:** Side effects and output

**What it does:** Sends a message to a specific channel

**When to use it:** When you want your bot to send a message to a different channel than where the command was sent

**How it works:**
- You specify which channel to send to
- The message appears as a regular message (not a reply)
- Useful for announcements or cross-channel communication

```javascript
say "Announcement" in channel "announcements"
```

**Example:**
```javascript
on command "announce":
    say "Server maintenance in 10 minutes!" in channel "general"
```

**What this does:**
- User types: `!announce` in #random
- Bot sends message to #general: "Server maintenance in 10 minutes!"

**Use cases:**
- Cross-channel announcements
- Sending to specific channels
- Bot status updates
- Logging to admin channels

**Channel name tips:**
- Use the exact channel name (case-sensitive)
- Don't include the # symbol
- Make sure your bot has permission to send to that channel

## say embed

**Concept:** Side effects and output (structured data)

**What it does:** Sends a rich embedded message with formatting, colors, and structured content

**When to use it:** When you want your message to look professional and visually appealing

**How it works:**
- Embeds are special message formats with a colored left border
- They can have titles, descriptions, fields, and more
- Great for important information, rules, or data display

```javascript
say embed:
    title "Welcome!"
    description "Read the rules before posting"
    color #5865F2
    field "Important" "Check #announcements"
```

**Embed properties:**
- `title` - Bold title at the top of the embed
- `description` - Main body text (supports basic formatting)
- `color` - Hex color for the left border (like #5865F2 for Discord blurple)
- `field` - Named field with a value (you can have multiple fields)

**Example:**
```javascript
on command "rules":
    say embed:
        title "Server Rules"
        description "Please follow these rules"
        color #ED4245
        field "Rule 1" "Be respectful"
        field "Rule 2" "No spam"
        field "Rule 3" "Stay on topic"
```

**What this does:**
- User types: `!rules`
- Bot sends a beautifully formatted embed with all the rules

**Common colors:**
- `#5865F2` - Discord blurple (default Discord color)
- `#57F287` - Discord green (success)
- `#ED4245` - Discord red (error/warning)
- `#FEE75C` - Discord yellow (attention)
- `#EB459E` - Discord pink (special)

**When to use embeds vs regular messages:**
- Use embeds for: Rules, important info, data display, announcements
- Use regular messages for: Simple responses, casual chat, quick replies

## say with components

**Concept:** Side effects and output (interactive UI)

**What it does:** Sends a message with interactive buttons or select menus

**When to use it:** When you want users to interact with your bot through buttons or dropdowns

**How it works:**
- Your bot sends a message with clickable elements
- Users click buttons or select options
- Your bot responds using `on button click` or `on select menu` handlers

**Buttons:**
```javascript
say with components "Choose an option:":
    button "approve" label "Approve"
    button "reject" label "Reject"
```

**Select menus:**
```javascript
say with components "Select a role:":
    select menu "role_select" with options:
        "Admin" as "admin"
        "Moderator" as "mod"
        "Member" as "member"
```

**Example with buttons:**
```javascript
on slash "poll":
    say with components "Vote now!":
        button "yes" label "Yes"
        button "no" label "No"

on button click "yes":
    reply "You voted yes!"

on button click "no":
    reply "You voted no!"
```

**What this does:**
- User types `/poll`
- Bot sends a message with "Yes" and "No" buttons
- User clicks "Yes"
- Bot responds: "You voted yes!"

**Use cases:**
- Interactive user interfaces
- Role selection
- Approval workflows
- Polls and voting
- Configuration menus

**Important:** Button clicks and select menu selections are handled using separate handlers (`on button click` and `on select menu`).

## let

**Concept:** Variables and scoping

**What it does:** Declares a variable to store a value for use in your handler

**When to use it:** When you need to store a value temporarily to use later in the same handler

**How it works:**
- Creates a named container for a value
- You can use the variable name instead of the value
- Variables only exist within the handler they're created in

```javascript
let points = load user.id points or 0
let userName = user.username
```

**Example:**
```javascript
on command "status":
    let points = load user.id points or 0
    let level = points / 10
    reply "You have {points} points (Level {level})"
```

**What this does:**
- Loads the user's points (or 0 if they don't have any)
- Calculates their level by dividing points by 10
- Uses both variables in the response

**Use cases:**
- Storing temporary values
- Calculating results
- Simplifying complex expressions
- Making code more readable

**Variable naming tips:**
- Use descriptive names (points, userName, not x, y)
- Use camelCase (first letter lowercase, capitalize subsequent words)
- Make names meaningful so you remember what they store

## store

**Concept:** Key-value storage and persistence

**What it does:** Saves a value to the database so it persists across bot restarts

**When to use it:** When you need to remember data for later (even after the bot restarts)

**How it works:**
- Saves data to a built-in database
- Data persists even if the bot restarts
- You can load it back later with `load`

```javascript
store user.id points 100
store server.id "last_announcement" "Welcome message"
```

**Example:**
```javascript
on command "setpoints":
    store user.id points args[0]
    reply "Set your points to {args[0]}"
```

**What this does:**
- User types: `!setpoints 500`
- Bot saves 500 as the user's points
- Bot confirms: "Set your points to 500"
- Even if the bot restarts, the points are saved

**Use cases:**
- Persisting user data (points, level, etc.)
- Server configuration
- Tracking state across events
- Remembering user preferences

**How data is organized:**
- First argument: Namespace (like user.id or server.id)
- Second argument: Key (like "points" or "last_announcement")
- Third argument: Value (what to store)

## load

**Concept:** Key-value storage and persistence

**What it does:** Loads a value from the database that was previously saved

**When to use it:** When you need to retrieve stored data

**How it works:**
- Looks up data in the database
- Returns the value if found
- Can provide a default value if nothing is found

```javascript
let points = load user.id points or 0
let config = load server.id "setting" or "default"
```

**Example:**
```javascript
on command "points":
    let points = load user.id points or 0
    reply "You have {points} points"
```

**What this does:**
- User types: `!points`
- Bot loads their points from the database
- If they don't have points saved, uses 0 as default
- Bot responds with their point total

**Use cases:**
- Retrieving user data
- Loading configuration
- Checking stored state
- Getting saved preferences

**The `or` keyword:**
- Provides a default value if nothing is found
- Prevents errors when data doesn't exist
- Essential for first-time users

## if / else

**Concept:** Boolean logic and branching

**What it does:** Conditional logic - runs code only if a condition is true

**When to use it:** When you want your bot to make decisions based on conditions

**How it works:**
- Checks if a condition is true
- If yes, runs the code inside the if block
- If no, skips the code (or runs the else block if you have one)

```javascript
if user has role "Admin":
    reply "You have admin access"
else:
    reply "Regular user access"
```

**With else if:**
```javascript
if points > 100:
    reply "VIP level"
else if points > 50:
    reply "Regular level"
else:
    reply "New member"
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

**What this does:**
- User types: `!ban @TrollUser`
- Bot checks if the user has Admin role
- If yes: Bans the target and confirms
- If no: Says they don't have permission

**Use cases:**
- Permission checks
- Different responses based on conditions
- Error handling
- User tiers/levels

**Comparison operators:**
- `=` - Equal to
- `!=` - Not equal to
- `<` - Less than
- `>` - Greater than
- `<=` - Less than or equal to
- `>=` - Greater than or equal to

## for each

**Concept:** Iteration and collections

**What it does:** Loops through a collection (like all server members)

**When to use it:** When you need to do something for every item in a list

**How it works:**
- Goes through each item in a collection one by one
- Runs the code inside the loop for each item
- Useful for bulk operations

```javascript
for each member in server.members:
    say "Hello" in channel "general"
```

**Example:**
```javascript
on command "announceall":
    for each member in server.members:
        say "Welcome to our server!" in channel "general"
```

**What this does:**
- User types: `!announceall`
- Bot goes through every member in the server
- Sends a welcome message for each one
- (Note: This would spam the channel - use with caution!)

**Use cases:**
- Bulk operations
- Processing all members
- Data processing
- Batch updates

**Important:** Be careful with loops - they can send many messages quickly and hit Discord's rate limits.

## give role

**Concept:** Side effects and output (system state modification)

**What it does:** Gives a role to a user

**When to use it:** When you want to assign a role to someone

**How it works:**
- Adds the specified role to the user
- User gains all permissions that role has
- Role must already exist in the server

```javascript
give user role "Member"
give target role "VIP"
```

**Example:**
```javascript
on join:
    give user role "New Member"
    reply "Welcome! You've been given the New Member role."
```

**What this does:**
- New user joins the server
- Bot gives them the "New Member" role
- Bot welcomes them

**Use cases:**
- Auto-role assignment
- Reward systems
- Permission granting
- Onboarding flows

**Important:** Your bot must have the "Manage Roles" permission to give roles.

## remove role

**Concept:** Side effects and output (system state modification)

**What it does:** Removes a role from a user

**When to use it:** When you want to take away a role from someone

**How it works:**
- Removes the specified role from the user
- User loses permissions that role had
- User must have the role for this to work

```javascript
remove user role "Member"
remove target role "VIP"
```

**Example:**
```javascript
on command "timeout":
    remove user role "Active"
    give user role "Muted"
    reply "You've been muted for 10 minutes"
```

**What this does:**
- User types: `!timeout @Spammer`
- Bot removes their "Active" role
- Bot gives them the "Muted" role
- Bot confirms the timeout

**Use cases:**
- Role removal
- Permission revocation
- Timeout systems
- Demotions

## mute

**Concept:** Side effects and output (system state modification)

**What it does:** Mutes a user (requires a Muted role to exist in the server)

**When to use it:** For temporary silencing without kicking/banning

**How it works:**
- Gives the user a "Muted" role
- The Muted role should have no permission to send messages
- User can still see messages but can't send them

```javascript
mute target for 10 minutes
mute user for 1 hour
```

**Example:**
```javascript
on command "mute":
    if user has role "Mod":
        mute target for 10 minutes
        reply "Muted {target.username}"
    else:
        reply "You don't have permission to mute"
```

**What this does:**
- Moderator types: `!mute @Spammer`
- Bot gives the user the Muted role for 10 minutes
- User can no longer send messages
- Bot confirms the mute

**Use cases:**
- Temporary silencing
- Rule enforcement
- Spam prevention
- Cooling down arguments

**Important:** You need to create a "Muted" role in your server with no message permissions for this to work.

**Duration units:**
- `seconds` / `second`
- `minutes` / `minute`
- `hours` / `hour`
- `days` / `day`

## kick

**Concept:** Side effects and output (system state modification)

**What it does:** Kicks a user from the server (they can rejoin with a new invite)

**When to use it:** For temporary removal as a warning or punishment

**How it works:**
- Removes the user from the server
- They can rejoin if they have an invite link
- Less severe than banning

```javascript
kick target
```

**Example:**
```javascript
on command "kick":
    if user has role "Admin":
        kick target
        reply "Kicked {target.username}"
    else:
        reply "You don't have permission to kick"
```

**What this does:**
- Admin types: `!kick @RuleBreaker`
- Bot kicks the user from the server
- Bot confirms the kick

**Use cases:**
- Moderation
- Rule enforcement
- Temporary removal
- Warnings

**Important:** Your bot must have the "Kick Members" permission.

## ban

**Concept:** Side effects and output (system state modification)

**What it does:** Bans a user from the server (they cannot rejoin)

**When to use it:** For permanent removal due to serious rule violations

**How it works:**
- Permanently removes the user from the server
- They cannot rejoin even with an invite
- Only an admin can unban them

```javascript
ban target
```

**Example:**
```javascript
on command "ban":
    if user has role "Admin":
        ban target
        reply "Banned {target.username}"
    else:
        reply "You don't have permission to ban"
```

**What this does:**
- Admin types: `!ban @Spammer`
- Bot permanently bans the user
- Bot confirms the ban

**Use cases:**
- Permanent removal
- Rule enforcement
- Security
- Dealing with spammers/trolls

**Important:** Your bot must have the "Ban Members" permission. Use bans carefully - they're permanent.

## wait

**Concept:** Asynchronous programming and timing

**What it does:** Pauses execution for a specified time

**When to use it:** When you need delays between actions

**How it works:**
- Pauses the bot for the specified duration
- Other handlers can still run during the wait
- Useful for timed sequences or rate limiting

```javascript
wait 5 seconds
say "This appears 5 seconds later"
```

**Example:**
```javascript
on command "remind":
    reply "I'll remind you in 1 minute"
    wait 1 minute
    reply "Here's your reminder!"
```

**What this does:**
- User types: `!remind`
- Bot says it will remind them
- Bot waits 1 minute
- Bot sends the reminder

**Use cases:**
- Delays
- Timed sequences
- Rate limiting
- Scheduled messages

**Time units:**
- `second` / `seconds`
- `minute` / `minutes`
- `hour` / `hours`

## edit

**Concept:** Message mutation and state management

**What it does:** Changes the content of a message that was already sent

**When to use it:** When you need to update a message after sending it

**How it works:**
- Takes a message reference and new content
- Replaces the message's text with the new content
- Useful for status updates, corrections, or timed changes

```javascript
edit message to "Updated content"
```

**Example:**
```javascript
on command "status":
    reply "Checking status..."
    wait 2 seconds
    edit message to "Status: All systems operational"
```

**What this does:**
- User types: `!status`
- Bot replies: "Checking status..."
- Bot waits 2 seconds
- Bot edits the reply to: "Status: All systems operational"

**Use cases:**
- Status updates
- Correcting mistakes
- Timed message changes
- Progress indicators

## delete

**Concept:** Message cleanup and moderation

**What it does:** Removes a message from the channel

**When to use it:** When you need to clean up messages or remove inappropriate content

**How it works:**
- Takes a message reference
- Permanently removes the message from the channel
- Cannot be undone (except by message logs)

```javascript
delete message
```

**Example:**
```javascript
on command "cleanup":
    reply "This message will self-destruct in 5 seconds"
    wait 5 seconds
    delete message
```

**What this does:**
- User types: `!cleanup`
- Bot replies: "This message will self-destruct in 5 seconds"
- Bot waits 5 seconds
- Bot deletes its own message

**Use cases:**
- Temporary messages
- Auto-cleanup
- Removing sensitive information
- Moderation

## Common Questions

### Can I use multiple statements in one handler?

Yes! Just put them one after another:
```javascript
on command "status":
    let points = load user.id points or 0
    reply "You have {points} points"
    store user.id "last_check" "now"
```

### What's the difference between `reply` and `say`?

- `reply` - Responds to the triggering message (same channel)
- `say` - Sends to any channel you specify

### Do variables persist between handlers?

No, variables created with `let` only exist within their handler. Use `store` and `load` to persist data.

### Can I nest if statements?

Yes, you can put if statements inside other if statements:
```javascript
if points > 100:
    if user has role "VIP":
        reply "VIP with bonus points!"
```

## Next Steps

Now that you understand statements, learn about:
- [Handlers](./handlers.md) - Where you use statements
- [Expressions](./expressions.md) - How to work with data in statements
- [Bot Configuration](./bot-config.md) - Setting up your bot
