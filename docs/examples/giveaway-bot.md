# Giveaway Bot

A giveaway bot that runs random giveaways with buttons to enter.

```newt
bot name "GiveawayBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "giveaway":
    say with components "🎉 **GIVEAWAY** 🎉":
        button "enter_giveaway" label "Enter Giveaway"
    store channel.id "giveaway_entries" []
    store channel.id "giveaway_end_time" (now + 1 hour)
    reply "Giveaway started! Ends in 1 hour."

on button click "enter_giveaway":
    let entries = load channel.id "giveaway_entries" or []
    if user.id not in entries:
        entries.push user.id
        store channel.id "giveaway_entries" entries
        reply "You've entered the giveaway!"
    else:
        reply "You've already entered!"

on command "draw":
    let entries = load channel.id "giveaway_entries" or []
    if entries.length > 0:
        let winner = entries[random(0, entries.length)]
        say "🎉 **Winner: <@{winner}>** 🎉"
        store channel.id "giveaway_entries" []
    else:
        reply "No entries in the giveaway!"
```

**What this does:**
- `!giveaway` - Starts a giveaway with an "Enter Giveaway" button
- Clicking the button - Adds the user to the giveaway entries
- `!draw` - Randomly selects a winner from the entries

**Features:**
- Button-based entry system
- Prevents duplicate entries
- Random winner selection
- Tracks entries per channel
