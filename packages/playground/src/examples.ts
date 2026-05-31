export interface Example {
  id: string;
  name: string;
  description: string;
  source: string;
}

export const examples: Example[] = [
  {
    id: "hello-world",
    name: "Hello World",
    description: "A tiny bot with one command and a ready message.",
    source: `bot name "HelloNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on ready:
    say "HelloNewt is online!" in channel "bot-status"

on command "hello":
    reply "Hey there, {user.name}!"
`
  },
  {
    id: "welcome-bot",
    name: "Welcome Bot",
    description: "Greets new members with an embed and gives a role.",
    source: `bot name "WelcomeNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on join:
    give user role "Member"
    say embed:
        title "Welcome, {user.name}!"
        description "Read #rules first, then say hello in #general."
        color #5865F2
`
  },
  {
    id: "points-system",
    name: "Points System",
    description: "Tracks simple user points with store and load.",
    source: `bot name "PointsPal"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "points":
    let current = load user.id points or 0
    store user.id points = current + 1
    reply "You have {load user.id points} points."
`
  },
  {
    id: "quote-bot",
    name: "Quote Bot",
    description: "Fetches a quote with a friendly error fallback.",
    source: `bot name "QuoteNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "quote":
    try:
        let quote = fetch "https://api.quotable.io/random"
        reply quote
    on error:
        reply "I could not fetch a quote right now."
`
  },
  {
    id: "moderation-bot",
    name: "Moderation Bot",
    description: "Requires a moderator role before muting someone.",
    source: `bot name "ModNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "mute":
    require role "Moderator"
    mute target for 10 minutes
    reply "{target} has been muted for 10 minutes."
`
  },
  {
    id: "daily-reminder",
    name: "Daily Reminder",
    description: "Posts a recurring daily message.",
    source: `bot name "ReminderNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

at "09:00" daily:
    say "Good morning! Remember to check announcements." in channel "general"
`
  }
];
