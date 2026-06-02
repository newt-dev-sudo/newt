# Migration Guide: discord.js to Newt

This guide helps you migrate your existing discord.js bots to Newt's natural English syntax.

## Why Migrate?

- **Simpler syntax**: Write in natural English instead of JavaScript
- **Faster development**: Less boilerplate, more focus on logic
- **Easier maintenance**: Readable code that's easy to understand
- **Modern Discord features**: Built-in support for slash commands, buttons, modals, etc.

## Key Differences

### Event Handlers

**discord.js:**
```javascript
client.on('messageCreate', async (message) => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});
```

**Newt:**
```javascript
on command "ping":
    reply "Pong!"
```

### Slash Commands

**discord.js:**
```javascript
const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with pong');

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});
```

**Newt:**
```javascript
on slash "ping":
    reply "Pong!"
```

### Message Editing

**discord.js:**
```javascript
const msg = await message.reply('Checking...');
setTimeout(async () => {
  await msg.edit('Status: All systems operational');
}, 2000);
```

**Newt:**
```javascript
let msg = reply "Checking status..."
wait for 2 seconds
edit msg to "Status: All systems operational"
```

### Role Management

**discord.js:**
```javascript
const role = message.guild.roles.cache.find(r => r.name === 'Admin');
if (message.member.roles.cache.has(role.id)) {
  message.reply('You are an admin');
}
```

**Newt:**
```javascript
if user has role "Admin":
    reply "You are an admin"
```

### Channel Operations

**discord.js:**
```javascript
const channel = message.guild.channels.cache.find(c => c.name === 'general');
await channel.send('Hello!');
```

**Newt:**
```javascript
let generalChannel = channel named "general"
say "Hello!" in channel generalChannel
```

## Common Patterns

### Prefix Commands

**discord.js:**
```javascript
const prefix = '!';

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'kick') {
    const member = message.mentions.members.first();
    if (member) {
      await member.kick();
      message.reply(`Kicked ${member.user.tag}`);
    }
  }
});
```

**Newt:**
```javascript
bot prefix "!"

on command "kick":
    kick target
    reply "Kicked {target.username}"
```

### Buttons

**discord.js:**
```javascript
const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('primary')
      .setLabel('Click me')
      .setStyle(ButtonStyle.Primary)
  );

await message.reply({ content: 'Buttons!', components: [row] });

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'primary') {
    await interaction.reply('You clicked the button!');
  }
});
```

**Newt:**
```javascript
on command "button":
    reply "Click the button!" with components:
        button "Click me" id "primary" style "primary"

on button click "primary":
    reply "You clicked the button!"
```

### Modals

**discord.js:**
```javascript
const modal = new ModalBuilder()
  .setCustomId('myModal')
  .setTitle('My Modal');

const nameInput = new TextInputBuilder()
  .setCustomId('nameInput')
  .setLabel('Your name')
  .setStyle(TextInputStyle.Short);

const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
modal.addComponents(firstActionRow);

await interaction.showModal(modal);

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === 'myModal') {
    const name = interaction.fields.getTextInputValue('nameInput');
    await interaction.reply(`Hello, ${name}!`);
  }
});
```

**Newt:**
```javascript
on command "modal":
    show modal "User Info" id "myModal" with:
        input "Your name" id "nameInput" style "short"

on modal submit "myModal":
    let name = input "nameInput"
    reply "Hello, {name}!"
```

### Data Storage

**discord.js:**
```javascript
// Using a database or JSON file
const fs = require('fs');
const points = JSON.parse(fs.readFileSync('points.json', 'utf8'));

client.on('messageCreate', async (message) => {
  const userId = message.author.id;
  if (!points[userId]) points[userId] = 0;
  points[userId] += 10;
  fs.writeFileSync('points.json', JSON.stringify(points));
  message.reply(`You now have ${points[userId]} points`);
});
```

**Newt:**
```javascript
on command "addpoints":
    let points = load user.id points or 0
    let newPoints = points + 10
    store user.id points newPoints
    reply "You now have {newPoints} points"
```

## Migration Steps

### 1. Analyze Your Bot

- List all commands and their functionality
- Identify event handlers (message, reaction, join, etc.)
- Note any complex logic or external dependencies
- Document data storage requirements

### 2. Set Up Newt

```bash
npm install -g @newt-dev/cli
newt new my-bot
cd my-bot
npm install
```

### 3. Migrate Bot Configuration

**discord.js:**
```javascript
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
```

**Newt:**
```javascript
bot name "My Bot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"
```

### 4. Migrate Commands One by One

Start with simple commands and work your way to complex ones:

1. **Simple replies** - `!ping` → `on slash "ping": reply "Pong!"`
2. **Commands with arguments** - `!kick @user` → `on slash "kick": kick target`
3. **Conditional logic** - Role checks, permissions
4. **Data operations** - Store/load data
5. **Complex features** - Buttons, modals, embeds

### 5. Test Thoroughly

- Test each migrated command
- Verify permissions work correctly
- Check data persistence
- Test edge cases

### 6. Deploy

```bash
DISCORD_TOKEN=your_token npm start
```

## What's Not (Yet) Supported

- Advanced Discord features (threads, webhooks, voice)
- Complex external API integrations (use `fetch` for simple cases)
- Custom rate limiting
- Shard management

## Tips for Successful Migration

- **Start small**: Migrate simple commands first
- **Keep it natural**: Use Newt's natural English syntax instead of translating JavaScript patterns
- **Leverage built-ins**: Use `role named`, `channel named`, etc. instead of manual lookups
- **Test incrementally**: Build and test after each command migration
- **Read the docs**: Check [Expressions](../reference/expressions.md) and [Statements](../reference/statements.md) for available features

## Getting Help

- Check the [Examples](../examples/) for reference implementations
- Review the [API Reference](../reference/) for detailed syntax
- Join the community for support

## Next Steps

- [Your First Bot](./your-first-bot.md) - Get started with Newt
- [Building Interactive Bots](./building-interactive-bots.md) - Buttons, modals, and more
- [Examples](../examples/) - Real-world bot examples
