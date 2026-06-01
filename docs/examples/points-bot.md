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
    reply "Leaderboard feature coming soon - check the roadmap!"
```

## What It Does

- `!addpoints` - Adds 10 points to the user
- `!points` - Shows the user's current point total
- `!leaderboard` - Placeholder for leaderboard (coming soon)
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

## How to Run

```bash
newt token YOUR_BOT_TOKEN
newt run points-bot.newt
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
