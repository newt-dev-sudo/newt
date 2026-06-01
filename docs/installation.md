# Installation

This guide will help you install Newt on your computer so you can start building Discord bots.

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

You should see version information like `@newt-dev/cli 0.1.0`.

### Option 2: Local Installation

Install Newt only in a specific project folder:

```bash
npm install @newt-dev/cli
```

Then use it with `npx`:
```bash
npx newt check my-bot.newt
```

**When to use this:** If you only want to use Newt in one project or don't have permission to install globally.

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

## Next Steps

Now that Newt is installed, you're ready to build your first bot!

- [Quickstart Guide](./quickstart.md) - Build your first Discord bot in 5 minutes
- [Token Security](./security.md) - Learn how to keep your bot safe
- [Language Reference](./reference/bot-config.md) - Explore all available commands
