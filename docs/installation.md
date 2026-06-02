# Installation

This guide will help you install Newt on your computer so you can start building Discord bots.

## What is a Discord Bot?

A Discord bot is like an automated user that can respond to messages, perform actions, and interact with your server. Think of it as a custom assistant that follows rules you define.

**What can bots do?**
- Automatically welcome new members
- Play music in voice channels
- Moderate content and enforce rules
- Run games and point systems
- Send scheduled announcements
- And much more!

**How it works:**
1. You write instructions in plain English using Newt
2. Newt translates your instructions into code
3. Your bot runs on your computer and connects to Discord
4. When something happens in your server, your bot responds according to your instructions

## What You Need Before Installing

### Node.js

**What is it?** Node.js is a program that runs JavaScript code outside of a web browser. Your Discord bot needs it to run.

**How to get it:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS (Long Term Support) version - it's the most stable
3. Run the installer and follow the prompts

**Why version 18 or higher?** Newt uses Node.js native fetch() for HTTP requests, which requires Node.js 18 or later.

### npm

**What is it?** npm (Node Package Manager) comes with Node.js. It's a tool that helps you download and manage software packages like Newt.

**How to check if you have it:**
```bash
npm --version
```

If you see a version number, you're good to go!

### A Text Editor

You'll need a program to write your Newt code. We recommend:

- **VS Code** - Free, popular, and has great Newt support
- Download from [code.visualstudio.com](https://code.visualstudio.com/)

## Installing Newt

### Option 1: Global Installation (Recommended)

This installs Newt on your entire computer so you can use it from anywhere.

**Run this command:**
```bash
npm install -g @newt-dev/cli
```

**What this does:**
- Downloads the Newt tool
- Makes the `newt` command available in your terminal
- Lets you use Newt from any folder on your computer

**Verify it worked:**
```bash
newt --version
```

You should see version information like `@newt-dev/cli 0.5.0`.

**Next Step:** Install the [VS Code extension](#setting-up-your-editor) for syntax highlighting.

### Option 2: Local Installation

Install Newt only in a specific project folder:

```bash
npm install @newt-dev/cli
```

Then use it with `npx`:
```bash
npx newt check my-bot.newt
npx newt run my-bot.newt
```

**When to use this:** If you only want to use Newt in one project or don't have permission to install globally.

**Next Step:** Install the [VS Code extension](#setting-up-your-editor) for syntax highlighting.

### Option 3: Development Installation

If you're developing Newt itself or want to use the latest development version:

```bash
# Clone the repository
git clone https://github.com/newt-dev-sudo/newt.git
cd newt

# Install dependencies
npm install

# Build the CLI
npm run build

# Use the CLI directly
node packages/cli/dist/src/index.js <command>
```

**When to use this:** If you're contributing to Newt or want to test the latest features before they're published.

## Troubleshooting Installation

### "Permission denied" (Linux/Mac)

If you get a permission error, try:
```bash
sudo npm install -g @newt-dev/cli
```

### "Command not found" (Windows)

If `newt` command doesn't work:

1. **Restart your terminal** - Sometimes it needs a restart to recognize new commands
2. **Check your PATH** - Make sure npm's global bin folder is in your system PATH
3. **Find where npm installs packages:**
   ```bash
   npm config get prefix
   ```
   This shows where packages are installed. Add this folder to your PATH.

### "npm is not recognized"

This means Node.js isn't installed or isn't in your PATH:

1. Make sure you installed Node.js
2. Restart your computer after installing
3. Try reinstalling Node.js

## Setting Up Your Editor

### VS Code (Recommended)

1. Install [VS Code](https://code.visualstudio.com/)
2. Download the [Newt Language Extension](https://github.com/newt-dev-sudo/newt/releases/tag/v0.1.0) (.vsix file)
3. Open VS Code
4. Go to Extensions (Ctrl+Shift+X)
5. Click the "..." menu in the top right
6. Select "Install from VSIX..."
7. Choose the downloaded `.vsix` file
8. Reload VS Code when prompted

**What this gives you:**
- Syntax highlighting (colors in your code)
- Better code readability
- Language configuration for comments and indentation

### Other Editors

Newt files use the `.newt` extension. You can:
- Use plain text editing
- Configure your editor for generic syntax highlighting
- Use any editor you're comfortable with

## System Requirements

### Operating Systems

- **Windows** - Windows 10 or later
- **macOS** - macOS 10.15 (Catalina) or later
- **Linux** - Any modern distribution (Ubuntu, Debian, Fedora, etc.)

### Hardware

- **RAM:** 512MB minimum (most computers have way more)
- **Disk Space:** 100MB for Newt installation
- **Network:** Required for downloading Newt and connecting to Discord

### What This Means

If your computer was made in the last 10 years, it probably meets these requirements. You don't need a powerful computer to run Discord bots.

## Newt CLI Commands

Once installed, you can use these commands:

```bash
newt check <file>           # Check .newt file for syntax errors
newt run <file>             # Run a .newt bot
newt token <token>          # Save your Discord bot token
newt token --clear          # Clear saved token
newt token                  # Check if token is set
newt new [name]             # Create a new bot file
newt new [name] --template hello|welcome|points|blank
newt deploy <file>          # Deploy bot (for hosting services)
newt --help                 # Show help
```

**Most commonly used:**
- `newt token` - Set your Discord token
- `newt run <file>` - Run your bot
- `newt check <file>` - Validate syntax before running
- `newt new mybot` - Create a new bot from template

## Upgrading Newt

To get the latest version with new features and bug fixes:

```bash
npm update -g @newt-dev/cli
```

**What this does:** Updates Newt to the newest version while keeping your settings.

## Uninstalling Newt

If you want to remove Newt from your computer:

```bash
npm uninstall -g @newt-dev/cli
```

**Note:** This won't delete any bots you've created - just the Newt tool itself.

## Getting Your Bot Token

Before you can run a bot, you need a bot token from Discord. This token is like a password that lets your bot connect to Discord.

### Step 1: Go to Discord Developer Portal

1. Visit [discord.com/developers/applications](https://discord.com/developers/applications)
2. Log in with your Discord account

### Step 2: Create a New Application

1. Click "New Application" in the top right corner
2. Give it a name (e.g., "MyBot")
3. Click "Create"

### Step 3: Create a Bot User

1. Click "Bot" in the left sidebar
2. Click "Add Bot"
3. Confirm by clicking "Yes, do it!"

### Step 4: Get Your Token

1. Click "Reset Token" (or "Copy Token" if available)
2. **Important:** Keep this token secret! Never share it or commit it to GitHub
3. Copy the token - you'll need it in the next step

### Step 5: Enable Intents

Intents are permissions that tell Discord what events your bot needs to know about:

1. Still on the Bot page
2. Scroll to "Privileged Gateway Intents"
3. Enable "Message Content Intent" - lets your bot read message content
4. Enable "Server Members Intent" - lets your bot know when members join/leave
5. Click "Save Changes"

### Step 6: Save Your Token

Once you have your token, save it securely:

```bash
newt token YOUR_BOT_TOKEN_HERE
```

This stores your token in Newt's secure configuration. You won't have to type it every time.

**Security Note:** Never share your bot token publicly. If someone gets your token, they can control your bot.

## Inviting Your Bot to a Server

Your bot needs to be invited to a server to work. Here's how:

### Step 1: Generate an Invite Link

1. In the Developer Portal, go to your application
2. Click "OAuth2" in the left sidebar
3. Click "URL Generator"
4. Under "Scopes", check "bot"
5. Under "Bot Permissions", check these basic permissions:
   - Send Messages
   - Read Messages/View Channels
   - Add Reactions
   - Embed Links (if you want rich embeds)
   - Attach Files (if you want file uploads)
6. Copy the generated URL at the bottom

### Step 2: Invite Your Bot

1. Paste the URL in your browser
2. Select the server you want to add the bot to
3. Click "Authorize"
4. Complete the CAPTCHA if needed

### Step 3: Your Bot is Now in the Server!

- You should see it in the member list (it will be offline until you run it)
- You can now run your bot with `newt run your-bot.newt`
- Once running, your bot will appear online

**Troubleshooting:**
- If you don't see the bot in the member list, try refreshing Discord
- Make sure you have "Manage Server" permission in the server
- If the invite link doesn't work, regenerate it and try again

## Next Steps

Now that Newt is installed, you're ready to build your first bot!

- [Quickstart Guide](./quickstart.md) - Build your first Discord bot in 5 minutes
- [Token Security](./security.md) - Learn how to keep your bot safe
- [Language Reference](./reference/bot-config.md) - Explore all available commands
