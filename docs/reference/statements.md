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

**Ephemeral replies (only visible to the user):**
```javascript
reply ephemeral "This is only visible to you"
```

**Example:**
```javascript
on command "hello":
    reply "Hi there, {user.username}!"

on command "secret":
    reply ephemeral "This is a secret message just for you"
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
- `author` - Author name shown at the top
- `footer` - Footer text shown at the bottom
- `image` - Large image displayed in the embed
- `thumbnail` - Small thumbnail image in the corner
- `url` - URL that the title links to
- `timestamp` - Shows the current time in the embed

**Example:**
```javascript
on command "rules":
    say embed:
        title "Server Rules"
        description "Please follow these rules"
        color #ED4245
        author "Admin Team"
        footer "Last updated: Today"
        image "https://example.com/banner.png"
        thumbnail "https://example.com/icon.png"
        url "https://example.com/rules"
        timestamp
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

**Button with style:**
```javascript
say with components "Choose an option:":
    button "approve" label "Approve" style "success"
    button "reject" label "Reject" style "danger"
    button "info" label "More Info" style "secondary"
    button "website" label "Visit Site" style "link" url "https://example.com"
```

**Select menus:**
```javascript
say with components "Select a role:":
    select menu "role_select" with options:
        "Admin" as "admin"
        "Moderator" as "mod"
        "Member" as "member"
```

**Advanced select menu types:**
```javascript
# Channel selection (auto-populated by Discord)
say with components "Select a channel:":
    select menu "channel_select" type "channel"

# User selection (auto-populated by Discord)
say with components "Select a user:":
    select menu "user_select" type "user"

# Role selection (auto-populated by Discord)
say with components "Select a role:":
    select menu "role_select" type "role"

# Mentionable selection (auto-populated by Discord)
say with components "Select mentionable:":
    select menu "mentionable_select" type "mentionable"
```

**Important:** Select menu selections are handled using the `on menu` handler.

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

**Button styles:**
- `primary` - Blue button (default)
- `secondary` - Gray button
- `success` - Green button
- `danger` - Red button
- `link` - Gray button that opens a URL (requires `url` parameter)

**Select menu types:**
- `string` - Text options (default)
- `channel` - Channel selection
- `role` - Role selection
- `user` - User selection
- `mentionable` - Users and roles

## show modal

**Concept:** Interactive UI (forms and input)

**What it does:** Displays a modal dialog with text input fields

**When to use it:** When you need to collect structured input from users

**How it works:**
- Shows a popup dialog with text input fields
- User fills in the fields and submits
- Your bot handles the submission with `on modal submit`

```javascript
show modal "feedback_form" title "Feedback":
    input "name" label "Your Name" style "short" required
    input "message" label "Your Message" style "paragraph" required
```

**Example:**
```javascript
on slash "feedback":
    show modal "feedback_form" title "Send Feedback":
        input "name" label "Your Name" style "short" required
        input "message" label "Your Message" style "paragraph" required

on modal submit "feedback_form":
    reply "Thanks {fields.getTextValue('name')} for your feedback!"
```

**What this does:**
- User types `/feedback`
- Bot shows a modal with name and message fields
- User fills in the form and submits
- Bot thanks them by name

**Use cases:**
- Feedback forms
- Bug reports
- Applications
- Surveys
- Data collection

**Input styles:**
- `short` - Single line text input
- `paragraph` - Multi-line text input

**Important:** Modals are triggered from interactions (slash commands, button clicks, etc.). They cannot be shown from regular message commands.

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
store user.id points = 100
store server.id "last_announcement" = "Welcome message"
```

**Example:**
```javascript
on command "setpoints":
    store user.id points = args[0]
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
let config = load server.id setting or "default"
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

> ⚠️ **Rate Limit Warning:** Discord has strict rate limits on how many messages a bot can send per second (typically 10 messages per second). Never loop through large collections like `server.members` and send a message for each item - this will get your bot suspended. Always add delays or use batch operations.

```javascript
# Safe example - small list
for each item in ["apple", "banana", "cherry"]:
    say "I like {item}"
```

**Example:**
```javascript
on command "listitems":
    for each item in ["item1", "item2", "item3"]:
        say "Item: {item}"
```

**What this does:**
- User types: `!listitems`
- Bot goes through each item in the list
- Sends a message for each one

**Use cases:**
- Processing small lists
- Data processing
- Batch updates

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

## unban

**Concept:** Side effects and output (system state modification)

**What it does:** Unbans a user from the server (allows them to rejoin)

**When to use it:** When you want to reverse a ban and allow a user back

**How it works:**
- Removes the user from the server's ban list
- They can rejoin if they have an invite
- Only an admin can unban users

```javascript
unban target
```

**Example:**
```javascript
on command "unban":
    if user has role "Admin":
        unban target
        reply "Unbanned {target.username}"
    else:
        reply "You don't have permission to unban"
```

**What this does:**
- Admin types: `!unban @ReformedUser`
- Bot removes the user from the ban list
- Bot confirms the unban

**Use cases:**
- Reversing bans
- Forgiving users
- Temporary bans
- Appeals process

**Important:** Your bot must have the "Ban Members" permission to unban users.

## pin message

**Concept:** Message management and organization

**What it does:** Pins a message to the channel (keeps it at the top)

**When to use it:** When you want to highlight important messages

**How it works:**
- Pins the specified message to the channel
- Pinned messages appear in a special section
- Useful for announcements, rules, or important info

```javascript
pin message
```

**Example:**
```javascript
on command "pin":
    pin message
    reply "Message pinned!"
```

**What this does:**
- User types: `!pin` in response to an important message
- Bot pins that message to the channel
- Bot confirms the pin

**Use cases:**
- Highlighting announcements
- Pinning rules
- Important information
- Reference material

**Important:** Your bot must have the "Manage Messages" permission.

## unpin message

**Concept:** Message management and organization

**What it does:** Unpins a message from the channel

**When to use it:** When you want to remove a pinned message

**How it works:**
- Removes the pin from the specified message
- Message is no longer highlighted
- Useful for updating pinned content

```javascript
unpin message
```

**Example:**
```javascript
on command "unpin":
    unpin message
    reply "Message unpinned!"
```

**What this does:**
- User types: `!unpin` in response to a pinned message
- Bot unpins that message
- Bot confirms the unpin

**Use cases:**
- Updating pinned content
- Removing outdated pins
- Managing channel organization
- Cleaning up old announcements

**Important:** Your bot must have the "Manage Messages" permission.

## add reaction

**Concept:** Message interaction and feedback

**What it does:** Adds a reaction emoji to a message

**When to use it:** When you want to add emoji reactions to messages

**How it works:**
- Adds the specified emoji to the target message
- Useful for feedback, voting, or marking messages
- Can use any Discord emoji

```javascript
add reaction to message with "👍"
add reaction to message with "✅"
```

**Example:**
```javascript
on command "approve":
    add reaction to message with "✅"
    reply "Marked as approved"
```

**What this does:**
- User types: `!approve` in response to a message
- Bot adds ✅ reaction to that message
- Bot confirms the action

**Use cases:**
- Marking messages as reviewed
- Voting systems
- Feedback collection
- Message categorization

## remove reaction

**Concept:** Message interaction and feedback

**What it does:** Removes a specific reaction emoji from a message

**When to use it:** When you want to remove a specific reaction

**How it works:**
- Removes the specified emoji from the target message
- Only removes that specific emoji
- Other reactions remain

```javascript
remove reaction from message with "👍"
remove reaction from message with "❌"
```

**Example:**
```javascript
on command "disapprove":
    remove reaction from message with "✅"
    add reaction to message with "❌"
    reply "Marked as disapproved"
```

**What this does:**
- User types: `!disapprove` in response to a message
- Bot removes ✅ reaction and adds ❌
- Bot confirms the action

**Use cases:**
- Changing votes
- Removing incorrect reactions
- Updating feedback
- Correcting mistakes

## clear reactions

**Concept:** Message cleanup and management

**What it does:** Removes all reactions from a message

**When to use it:** When you want to remove all emoji reactions from a message

**How it works:**
- Removes every reaction from the target message
- Message is left without any reactions
- Useful for cleaning up or resetting

```javascript
clear reactions from message
```

**Example:**
```javascript
on command "reset":
    clear reactions from message
    reply "All reactions cleared"
```

**What this does:**
- User types: `!reset` in response to a message
- Bot removes all reactions from that message
- Bot confirms the cleanup

**Use cases:**
- Resetting votes
- Cleaning up old reactions
- Starting fresh
- Message cleanup

## create role

**Concept:** Server management and organization

**What it does:** Creates a new role in the server

**When to use it:** When you need to create roles dynamically

**How it works:**
- Creates a new role with the specified name
- Role has default permissions initially
- Can be modified after creation

```javascript
create role "Moderator"
create role "VIP"
```

**Example:**
```javascript
on command "createrole":
    if user has role "Admin":
        create role args[0]
        reply "Created role: {args[0]}"
    else:
        reply "You don't have permission"
```

**What this does:**
- Admin types: `!createrole Helper`
- Bot creates a new role named "Helper"
- Bot confirms the creation

**Use cases:**
- Dynamic role creation
- Automated role setup
- Server organization
- Temporary roles

**Important:** Your bot must have the "Manage Roles" permission.

## delete role

**Concept:** Server management and organization

**What it does:** Deletes a role from the server

**When to use it:** When you need to remove a role

**How it works:**
- Deletes the specified role
- All members lose that role
- Cannot be undone

```javascript
delete role target
```

**Example:**
```javascript
on command "deleterole":
    if user has role "Admin":
        delete role target
        reply "Deleted role"
    else:
        reply "You don't have permission"
```

**What this does:**
- Admin types: `!deleterole @Helper`
- Bot deletes the Helper role
- Bot confirms the deletion

**Use cases:**
- Removing unused roles
- Cleaning up server
- Role management
- Server reorganization

**Important:** Your bot must have the "Manage Roles" permission. Be careful - this affects all members with that role.

## edit role

**Concept:** Server management and organization

**What it does:** Changes a role's name

**When to use it:** When you need to rename a role

**How it works:**
- Changes the role's name to the new name
- All permissions and members remain the same
- Only the name changes

```javascript
edit role target to "New Name"
```

**Example:**
```javascript
on command "renamerole":
    if user has role "Admin":
        edit role target to args[0]
        reply "Renamed role to {args[0]}"
    else:
        reply "You don't have permission"
```

**What this does:**
- Admin types: `!renamerole @Helper Assistant`
- Bot renames the Helper role to Assistant
- Bot confirms the rename

**Use cases:**
- Role renaming
- Corrections
- Rebranding
- Organization updates

**Important:** Your bot must have the "Manage Roles" permission.

## dm send

**Concept:** Direct messaging and private communication

**What it does:** Sends a direct message to a user

**When to use it:** When you want to send a private message to a user

**How it works:**
- Sends a message directly to the user's DMs
- Only the recipient can see the message
- Useful for private notifications

```javascript
dm user send "This is a private message"
dm target send "You've been warned"
```

**Example:**
```javascript
on command "warn":
    if user has role "Mod":
        dm target send "You have been warned for rule violation"
        reply "Warning sent to {target.username}"
    else:
        reply "You don't have permission"
```

**What this does:**
- Moderator types: `!warn @RuleBreaker`
- Bot sends a private DM to the user
- Bot confirms the warning was sent

**Use cases:**
- Private warnings
- Personal notifications
- Sensitive information
- Direct communication

**Important notes:**
- Users can disable DMs from bots
- The message will fail if the user has DMs disabled
- Your bot must share a server with the user

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

> ⚠️ **Known Limitation:** Edit statement is implemented but has a syntax limitation - you cannot store message references from `reply` statements using `let`. See the [Roadmap](../roadmap.md) for status.

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

> ⚠️ **Known Limitation:** Delete statement is implemented but has a syntax limitation - you cannot store message references from `reply` statements using `let`. See the [Roadmap](../roadmap.md) for status.

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

## upload

**Concept:** File I/O and multimedia handling

**What it does:** Sends a file to the channel

**When to use it:** When you need to share images, documents, or other files

**How it works:**
- Takes a file path (relative to the bot's directory)
- Optionally includes a message with the file
- The file is uploaded to Discord and displayed in the channel

```javascript
upload "./image.png" with message "Here's an image!"
```

**Without a message:**
```javascript
upload "./document.pdf"
```

**Example:**
```javascript
on command "sendimage":
    upload "./welcome.png" with message "Welcome to the server!"
```

**What this does:**
- User types: `!sendimage`
- Bot uploads the file `./welcome.png` with the message "Welcome to the server!"

**Use cases:**
- Sharing images
- Sending documents
- Uploading logs
- Multimedia content

**Important notes:**
- File paths are relative to where the bot is running
- The file must exist at the specified path
- File size limits apply (Discord's upload limits)

## set activity

**Concept:** Rich presence and bot status management

**What it does:** Sets the bot's activity status (what users see under the bot's name)

**When to use it:** When you want to show what your bot is doing

**How it works:**
- Changes the bot's "Playing..." status
- Visible to all users who can see the bot
- Can be changed dynamically as the bot runs

```javascript
set activity "Helping users"
```

**Example:**
```javascript
on ready:
    set activity "Online and ready"

on command "busy":
    set activity "Processing requests"
    reply "I'm now busy!"
```

**What this does:**
- When the bot starts, it shows "Online and ready"
- When someone types `!busy`, the bot changes to "Processing requests"

**Use cases:**
- Showing bot status
- Indicating availability
- Displaying helpful information
- Dynamic status updates

**Important notes:**
- The activity is visible to all users
- Can be changed at any time
- Only shows text (no complex activities like streaming)
- Updates immediately

## Common Questions

### Can I use multiple statements in one handler?

Yes! Just put them one after another:
```javascript
on command "status":
    let points = load user.id points or 0
    reply "You have {points} points"
    store user.id last_check = "now"
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
