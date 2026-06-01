# Graduating to Discord.js

Newt is designed to teach you fundamental programming concepts that transfer directly to real programming languages. This page shows how Newt code maps to Discord.js, the most popular library for Discord bots in JavaScript.

## Why Learn Discord.js?

After you're comfortable with Newt, you might want to:
- Build more complex bots with advanced features
- Integrate with other APIs and services
- Deploy to professional hosting environments
- Join a larger community of Discord bot developers

Discord.js is the next natural step - it's what Newt compiles to, and the concepts you learned in Newt apply directly.

## Concept Mapping

| Newt Concept | Discord.js Equivalent | What You Learned |
|--------------|---------------------|------------------|
| `on command` | `client.on('messageCreate')` | Event-driven programming |
| `reply` | `message.reply()` | Sending responses |
| `if / else` | `if / else` | Conditional logic |
| `let` | `let / const` | Variables |
| `store / load` | Database/SQLite | Data persistence |
| `user.username` | `message.author.username` | Object properties |

## Side-by-Side Examples

### Simple Hello Command

**Newt:**
```newt
bot name "MyBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "hello":
    reply "Hello, {user.username}!"
```

**Discord.js:**
```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', message => {
    if (message.content === '!hello') {
        message.reply(`Hello, ${message.author.username}!`);
    }
});

client.login(process.env.DISCORD_TOKEN);
```

**What's the same:**
- Event-driven structure (responding to messages)
- Conditional logic (checking the command)
- Sending a reply
- Using variables (username)

**What's different:**
- Discord.js requires more setup (intents, client configuration)
- More verbose syntax
- Need to handle the event loop manually

---

### Points System

**Newt:**
```newt
on command "addpoints":
    let current = load user.id points or 0
    store user.id points = current + 10
    let newPoints = load user.id points or 0
    reply "You now have {newPoints} points."
```

**Discord.js:**
```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./points.db');

client.on('messageCreate', message => {
    if (message.content === '!addpoints') {
        const userId = message.author.id;
        
        db.get(`SELECT points FROM users WHERE id = ?`, [userId], (err, row) => {
            const current = row ? row.points : 0;
            const newPoints = current + 10;
            
            db.run(`INSERT OR REPLACE INTO users (id, points) VALUES (?, ?)`, [userId, newPoints], (err) => {
                message.reply(`You now have ${newPoints} points.`);
            });
        });
    }
});
```

**What's the same:**
- Loading and storing data
- Arithmetic operations
- Sending a response

**What's different:**
- Discord.js requires explicit database setup
- Callbacks for asynchronous operations
- More error handling needed

---

### Permission Check

**Newt:**
```newt
on command "kick":
    if user has role "Moderator":
        kick target
        reply "{target} was kicked."
    else:
        reply "You don't have permission."
```

**Discord.js:**
```javascript
client.on('messageCreate', message => {
    if (message.content.startsWith('!kick')) {
        const member = message.member;
        
        if (member.permissions.has('PermissionFlagsBits.KickMembers')) {
            const target = message.mentions.members.first();
            if (target) {
                target.kick();
                message.reply(`${target.user.username} was kicked.`);
            }
        } else {
            message.reply("You don't have permission.");
        }
    }
});
```

**What's the same:**
- Conditional logic (checking permissions)
- Taking action based on conditions
- Sending different responses

**What's different:**
- Discord.js uses permission flags instead of role names
- More explicit error checking
- Need to handle edge cases (no target mentioned)

---

### Welcome Message

**Newt:**
```newt
on join:
    say "Welcome {user.mention}!" in channel "general"
    give user role "New Member"
```

**Discord.js:**
```javascript
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
    if (channel) {
        channel.send(`Welcome ${member}!`);
    }
    
    const role = member.guild.roles.cache.find(role => role.name === 'New Member');
    if (role) {
        member.roles.add(role);
    }
});
```

**What's the same:**
- Event-driven (responding to member join)
- Sending a message
- Giving a role

**What's different:**
- Discord.js uses different event names
- Need to find channels/roles by name or ID
- More explicit null checking

---

## Key Differences to Know

### 1. Setup and Configuration

**Newt:** Handles setup automatically
```newt
bot name "MyBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"
```

**Discord.js:** Requires manual setup
```javascript
const client = new Client({ intents: [...] });
client.login(process.env.DISCORD_TOKEN);
```

### 2. Asynchronous Operations

**Newt:** Handles async automatically
```newt
store user.id points = 100
reply "Points saved!"
```

**Discord.js:** Requires async/await or callbacks
```javascript
await db.run('INSERT INTO users VALUES (?, ?)', [userId, 100]);
message.reply('Points saved!');
```

### 3. Error Handling

**Newt:** Built-in error messages
```newt
# If this fails, Newt shows an error
kick target
```

**Discord.js:** Manual error handling
```javascript
try {
    await target.kick();
} catch (error) {
    console.error('Failed to kick:', error);
}
```

### 4. Data Access

**Newt:** Simple key-value storage
```newt
load user.id points or 0
```

**Discord.js:** Full database or API access
```javascript
// Can use any database, API, or storage system
await db.get('SELECT * FROM users WHERE id = ?', [userId]);
```

## Learning Path

If you want to transition to Discord.js:

1. **Learn JavaScript basics** - Variables, functions, async/await
2. **Understand promises** - Discord.js uses promises heavily
3. **Read Discord.js docs** - [discord.js.org](https://discord.js.org)
4. **Start simple** - Convert your Newt bots one feature at a time
5. **Use examples** - Discord.js has great example code

## Resources

- [Discord.js Guide](https://discordjs.guide) - Official guide
- [Discord.js Documentation](https://discord.js.org) - API reference
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - JavaScript reference
- [Newt Discord Community](https://discord.gg/cXFCVz3VcR) - Ask for help

## You're Already Halfway There

The concepts you learned in Newt are the same concepts used in Discord.js:
- Event handlers → Event listeners
- Variables → Variables
- Conditionals → Conditionals
- Data storage → Databases/APIs
- Functions → Functions

The syntax is different, but the thinking is the same. You've already learned the hard part - how to think like a programmer. Discord.js is just learning a new way to write what you already know.
