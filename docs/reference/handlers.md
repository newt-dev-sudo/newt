# Event Handlers

Event handlers are the core of your bot's behavior. They define how your bot responds to different events in Discord - like when someone sends a command, joins the server, or reacts to a message.

## What are Event Handlers?

Think of event handlers like instructions you give your bot: "When X happens, do Y." Your bot is always listening for events, and when one occurs, it runs the corresponding handler.

**How they work:**
1. Discord sends an event to your bot (like a message being sent)
2. Your bot checks if it has a handler for that event
3. If yes, it runs the code in that handler
4. The handler can respond, take actions, or ignore the event

**Example in real life:**
- Event: Someone rings your doorbell
- Handler: You go to the door and see who it is
- Response: You greet them or ignore them

## Commands vs Events

**Commands are a specialized type of message event.**

When you use `on command`, Newt is actually listening for message events and checking if they start with your bot's prefix. This is a convenience - you don't have to manually check every message.

**How it works internally:**
```javascript
# This is what you write:
on command "hello":
    reply "Hi!"

# This is what's happening behind the scenes:
on message:
    if message starts with "!hello":
        reply "Hi!"
```

**Why this matters:**
- Commands are easier to use than raw message events
- Newt handles the prefix checking for you
- You can still use `on message` for more complex message handling
- `on command` and `on slash` are specialized handlers for common patterns

**When to use which:**
- Use `on command` for simple prefix-based commands (`!hello`, `!help`)
- Use `on slash` for Discord's modern slash commands (`/hello`, `/help`)
- Use `on message` when you need to react to any message content
- Use `on message contains` for keyword detection in messages

## Context Model

Each handler has access to specific variables (context) that provide information about the event. This context determines what data is available in your handler.

**Available in most handlers:**
- `user` - The Discord user object (username, ID, etc.)
- `channel` - The channel where the event occurred
- `server` - The server (guild) where the event occurred

**Available in message-related handlers:**
- `message` - The full message object (content, author, etc.)
- `args` - Command arguments (words after the command)
- `target` - First mentioned user (if applicable)

**Available in member-related handlers:**
- `member` - The member object (server-specific user data, roles, etc.)

**Available in interaction handlers:**
- `interaction` - The interaction object (for slash commands, buttons, menus)
- `values` - Selected values (for select menus)

**Handler-specific context:**

| Handler | Available Variables |
|---------|---------------------|
| `on ready` | None (bot is just starting) |
| `on command` | user, message, channel, server, args, target |
| `on slash` | user, channel, server, args, interaction |
| `on button click` | user, channel, server, interaction |
| `on select menu` | user, channel, server, values, interaction |
| `on message contains` | user, message, channel, server |
| `on join` | user, member, server |
| `on leave` | user, server |
| `on reaction add` | user, channel, server |

**Why context matters:**
- Not all variables are available in every handler
- Using a variable that doesn't exist will cause an error
- Check the "Available variables" section for each handler
- This prevents confusion about what data you can access

## on ready

**Concept:** Event-driven programming (initialization)

**What it does:** Runs when your bot starts up and successfully connects to Discord

**When it triggers:** Once, when your bot first comes online

**Why it's useful:** Perfect for initialization tasks - things that need to happen when your bot starts

```javascript
on ready:
    say "Bot is online!" in channel "general"
```

**Common use cases:**
- Sending startup announcements
- Initializing database connections
- Setting bot status
- Loading configuration

**Example:**
```javascript
on ready:
    say "🟢 {botName} is now online!" in channel "general"
```

**What this does:**
- When your bot starts, it sends a message to the #general channel
- Users can see your bot is online and ready

**Important notes:**
- This only runs once when the bot starts
- If your bot crashes and restarts, this runs again
- Don't put commands here - use `on command` for that

## on command

**Concept:** Event-driven programming (command pattern)

**What it does:** Responds to user commands with the configured prefix

**When it triggers:** When someone sends a message starting with your bot's prefix

**How it works:**
- If your prefix is `!`, users type `!hello` to trigger the hello command
- The handler receives the command name and any arguments
- Your bot can respond based on the command

```javascript
on command "hello":
    reply "Hello, {user.username}!"

on command "info":
    reply "This bot runs on Newt!"
```

**Available variables:**
- `user` - The user who sent the command
- `message` - The message object (the full message)
- `channel` - The channel where the command was sent
- `server` - The server (guild) where this happened
- `args` - Command arguments as an array (extra words after the command)
- `target` - First mentioned user (if someone was mentioned)

**Example with arguments:**
```javascript
on command "greet":
    reply "Hello, {args[0]}!"
```

**What this does:**
- User types: `!greet John`
- Bot responds: "Hello, John!"

**Example with multiple commands:**
```javascript
on command "hello":
    reply "Hi there!"

on command "bye":
    reply "Goodbye!"

on command "help":
    reply "Commands: hello, bye, help"
```

**Best practices:**
- Keep command names short and memorable
- Use lowercase command names
- Make commands intuitive (users should guess what they do)

## on slash

**Concept:** Event-driven programming (command pattern)

**What it does:** Responds to Discord slash commands (commands starting with `/`)

**When it triggers:** When someone uses a slash command registered with your bot

**How it's different from prefix commands:**
- Slash commands appear in Discord's command menu
- Users can see all available commands by typing `/`
- Discord shows command descriptions and options
- More discoverable than prefix commands

```javascript
on slash "greet":
    reply "Hello from slash command!"
```

**Available variables:**
- `user` - The user who invoked the command
- `channel` - The channel where the command was invoked
- `server` - The server (guild)
- `args` - Command options/arguments
- `interaction` - The interaction object (Discord's way of handling slash commands)

**Note:** Slash commands are automatically registered when your bot starts. They may take a few minutes to appear in Discord after the first run.

**Example:**
```javascript
on slash "ping":
    reply "Pong!"
```

**What this does:**
- User types `/ping` in Discord
- Discord shows the command in the menu
- Bot responds: "Pong!"

**Why use slash commands:**
- Better discoverability - users can see all commands
- Built-in validation - Discord checks input before sending to your bot
- Professional appearance - looks more polished
- Mobile-friendly - easier to use on phones

## on button click

**Concept:** Event-driven programming (interaction)

**What it does:** Triggers when a user clicks a button in a message component

**When it triggers:** When someone clicks a button your bot sent

**How it works:**
1. Your bot sends a message with buttons (using `say with components`)
2. User clicks one of the buttons
3. This handler runs with the button's ID
4. Your bot can respond to the click

```javascript
on button click "approve":
    reply "You clicked approve!"
```

**Available variables:**
- `user` - The user who clicked the button
- `channel` - The channel where the button was clicked
- `server` - The server (guild)
- `interaction` - The interaction object

**Example:**
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
- Polls and voting
- Approval workflows
- Interactive menus
- Confirmation dialogs

## on select menu

**Concept:** Event-driven programming (interaction)

**What it does:** Triggers when a user selects an option from a dropdown menu

**When it triggers:** When someone makes a selection from a select menu your bot sent

**How it works:**
1. Your bot sends a message with a select menu
2. User clicks the menu and selects options
3. This handler runs with the selected values
4. Your bot can respond to the selection

```javascript
on select menu "role_select":
    reply "You selected: {values.join(', ')}"
```

**Available variables:**
- `user` - The user who made a selection
- `channel` - The channel where the selection was made
- `server` - The server (guild)
- `values` - Array of selected values
- `interaction` - The interaction object

**Example:**
```javascript
on slash "role":
    say with components "Choose a role:":
        select menu "role_select" with options:
            "Admin" as "admin"
            "Moderator" as "mod"
            "Member" as "member"

on select menu "role_select":
    give user role values[0]
    reply "You now have the {values[0]} role!"
```

**What this does:**
- User types `/role`
- Bot sends a dropdown with role options
- User selects "Admin"
- Bot gives them the Admin role

**Use cases:**
- Role selection
- Configuration options
- Multi-choice responses
- Categorization

## on message contains

**Concept:** Event-driven programming (pattern matching)

**What it does:** Triggers when any message contains specific text

**When it triggers:** When a message is sent that includes the specified text

**How it works:**
- Your bot reads every message in channels it can see
- If the message contains your specified text, the handler runs
- This is different from commands - it's more like keyword detection

```javascript
on message contains "help":
    reply "Type !commands for help"

on message contains "bug":
    reply "Report bugs in #support"
```

**Use cases:**
- Auto-responses to keywords
- Content moderation
- Help triggers
- Easter eggs

**Example:**
```javascript
on message contains "hello":
    reply "Hi there!"
```

**What this does:**
- User types: "hello everyone"
- Bot responds: "Hi there!" (because "hello" is in the message)

**Important notes:**
- This triggers on ANY message containing the text, not just commands
- Be careful with common words - you might get too many triggers
- Case-sensitive by default

## on join

**Concept:** Event-driven programming (lifecycle events)

**What it does:** Triggers when a new member joins the server

**When it triggers:** When someone joins your Discord server

**Why it's useful:** Perfect for onboarding - welcoming new members, giving them roles, showing them around

```javascript
on join:
    say "Welcome to the server!" in channel "general"
    give user role "Member"
```

**Available variables:**
- `user` - The user who joined
- `member` - The member object (server-specific user data)
- `server` - The server they joined

**Example:**
```javascript
on join:
    say "Welcome {user.mention}! Read #rules before posting." in channel "general"
    give user role "New Member"
```

**What this does:**
- New user joins the server
- Bot sends a welcome message in #general
- Bot gives them the "New Member" role automatically

**Common use cases:**
- Welcome messages
- Auto-role assignment
- Onboarding flows
- Server information

## on leave

**Concept:** Event-driven programming (lifecycle events)

**What it does:** Triggers when a member leaves the server

**When it triggers:** When someone leaves or is kicked/banned from your server

**Why it's useful:** For logging, cleanup, or analytics

```javascript
on leave:
    say "{user.username} has left." in channel "general"
```

**Available variables:**
- `user` - The user who left
- `server` - The server they left

**Example:**
```javascript
on leave:
    say "Goodbye, {user.username}! We'll miss you." in channel "general"
```

**Use cases:**
- Logging departures
- Cleanup tasks (removing from databases)
- Analytics (tracking member count)
- Goodbye messages

## on reaction add

**Concept:** Event-driven programming (reaction events)

**What it does:** Triggers when someone reacts to a message

**When it triggers:** When a reaction emoji is added to any message

**How it works:**
- Your bot watches for reactions on messages
- When someone reacts with the specified emoji, your handler runs
- Great for reaction-based commands and interactions

```javascript
on reaction add "👍":
    reply "Thanks for the thumbs up!"

on reaction add "❌":
    reply "I understand you disagree"
```

**Use cases:**
- Reaction-based commands
- Polls and voting
- Feedback collection
- Simple confirmations

**Example:**
```javascript
on reaction add "✅":
    give user role "Verified"
    reply "You're now verified!"
```

**What this does:**
- User reacts with ✅ to any message
- Bot gives them the "Verified" role
- Bot confirms they're verified

**Common reactions:**
- 👍 - Approval/agreement
- 👎 - Disagreement
- ✅ - Confirmation/verification
- ❌ - Rejection/cancellation
- 🎉 - Celebration

## Multiple Handlers

You can have multiple handlers of the same type. This lets your bot respond to many different events.

```javascript
on command "hello":
    reply "Hello!"

on command "bye":
    reply "Goodbye!"

on command "help":
    reply "Available: hello, bye, help"
```

**How this works:**
- Each handler is independent
- When an event occurs, all matching handlers can run
- Order doesn't matter - Discord handles which handler matches

## Handler Best Practices

**Keep handlers focused**
- Each handler should do one thing well
- If a handler is getting complex, consider splitting it
- Focused handlers are easier to debug and maintain

**Use descriptive names**
- Command names should be intuitive
- Users should guess what a command does from its name
- Avoid abbreviations unless they're very common

**Add error handling**
- Use `try` blocks for operations that might fail
- Handle cases where data might be missing
- Provide helpful error messages to users

**Consider rate limits**
- Don't spam messages in rapid succession
- Discord has limits on how fast you can send messages
- Use delays or cooldowns for frequently used commands

**Slash commands vs prefix commands**
- Use slash commands for discoverability and professional appearance
- Use prefix commands for simplicity and quick testing
- You can use both in the same bot

## Common Questions

### Can I have two handlers for the same command?

No, only one handler will match each command. If you have duplicate command names, the behavior is undefined.

### What if I want a command to work in multiple ways?

Use arguments or conditional logic:
```javascript
on command "ban":
    if user has role "Admin":
        ban target
    else:
        reply "You don't have permission"
```

### Can handlers see each other's data?

Not directly. Use the database (`store` and `load`) to share data between handlers.

### What happens if a handler has an error?

The error is logged, but the bot keeps running. Other handlers will still work. Use `try` blocks to handle errors gracefully.

## Next Steps

Now that you understand handlers, learn about:
- [Statements](./statements.md) - What your handlers can do
- [Expressions](./expressions.md) - How to work with data in handlers
- [Bot Configuration](./bot-config.md) - Setting up your bot
