# Leveling System

A leveling system bot that gives users XP for messages and levels them up.

```newt
bot name "LevelBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on message:
    let xp = load user.id "xp" or 0
    let level = load user.id "level" or 1
    let newXP = xp + 10
    store user.id "xp" newXP
    
    let xpNeeded = level * 100
    if newXP >= xpNeeded:
        let newLevel = level + 1
        store user.id "level" newLevel
        say "🎉 {user.mention} leveled up to level {newLevel}!"
        
        if newLevel = 5:
            give user role "Member"
        else if newLevel = 10:
            give user role "Active"
        else if newLevel = 25:
            give user role "Veteran"

on command "level":
    let xp = load user.id "xp" or 0
    let level = load user.id "level" or 1
    let xpNeeded = level * 100
    let xpProgress = xp - ((level - 1) * 100)
    say embed:
        title "{user.username}'s Level"
        description "Level {level}"
        field "XP" "{xpProgress}/{xpNeeded}"
        color #5865F2

on command "leaderboard":
    say "🏆 **Leaderboard** - Top 10 users by level"
    # This would require iterating through all users' levels
    # For now, show a placeholder
    say "Leaderboard feature coming soon!"
```

**What this does:**
- Every message gives the user +10 XP
- When XP reaches the threshold, user levels up
- Leveling up grants roles at milestones (5, 10, 25)
- `!level` - Shows your current level and XP progress
- `!leaderboard` - Shows top users (placeholder for now)

**Features:**
- Automatic XP gain from messages
- Level-up announcements
- Role rewards for milestones
- Individual level tracking
- XP progress display with embeds
