# Music Bot

A simple music bot that plays audio in voice channels.

```newt
bot name "MusicBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "play":
    if args[0]:
        join voice channel
        play args[0]
        reply "Now playing: {args[0]}"
    else:
        reply "Please provide a song name or URL"

on command "skip":
    skip track
    reply "Skipped to next track"

on command "stop":
    stop music
    leave voice channel
    reply "Stopped playing and left voice channel"

on command "queue":
    reply "Current queue: {queue.join(', ')}"
```

**What this does:**
- `!play <song>` - Joins voice channel and plays the song
- `!skip` - Skips to the next track
- `!stop` - Stops playing and leaves voice channel
- `!queue` - Shows the current music queue

**Note:** This example shows the syntax. Actual music playback requires additional dependencies and audio processing that are not yet implemented in Newt.
