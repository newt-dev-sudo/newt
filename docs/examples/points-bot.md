# Points System Bot

A gamification bot that tracks user points with persistent storage.

## Code

```javascript
bot name "PointsPal"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on ready:
    say "PointsPal is tracking points." in channel "bot-status"

on command "addpoints":
    let current = load user.id points or 0
    store user.id points = current + 10
    let newPoints = load user.id points or 0
    reply "Nice, {user.username}! You now have {newPoints} points."

on command "points":
    let userPoints = load user.id points or 0
    reply "{user.username}, you have {userPoints} points."

on command "leaderboard":
    for each member in server.members:
        let memberPoints = load member.id points or 0
        say "{member.user.username}: {memberPoints} points" in channel "bot-commands"
```

## What It Does

- `!addpoints` - Adds 10 points to the user
- `!points` - Shows the user's current point total
- `!leaderboard` - Lists all members and their points
- Points persist across bot restarts using SQLite

## Key Concepts

### Persistent Storage

```javascript
let current = load user.id points or 0
store user.id points = current + 10
```

- `load` retrieves stored values
- `store` saves values to the database
- `or 0` provides a default for new users

### Iteration

```javascript
for each member in server.members:
    let memberPoints = load member.id points or 0
    say "{member.user.username}: {memberPoints} points"
```

- Iterates over all server members
- Loads and displays each member's points

## How to Run

```bash
newt build points-bot.newt --out points-bot
cd points-bot
npm install
DISCORD_TOKEN="your-token" npm start
```

## Use Cases

- Community engagement
- Reward systems
- Gamification
- Activity tracking

## Extensions

- Add point decay over time
- Create point redemption system
- Add point multipliers for roles
- Implement point transfer between users
