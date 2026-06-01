# Setting Up Your Computer

Before you can create Discord bots with Newt, you need to set up your computer with the necessary tools. This guide walks you through installing Node.js and opening a terminal on Windows, Mac, and Linux.

## What You Need

**Node.js** - A program that runs JavaScript code outside of a web browser. Your Discord bot needs this to run.

**Why Node.js 18 or higher?** Newt uses modern JavaScript features that require Node.js 18 or later.

## Installing Node.js

### Windows

1. **Download Node.js**
   - Go to [nodejs.org](https://nodejs.org)
   - Click the green "LTS" (Long Term Support) button
   - This downloads the most stable version

2. **Run the Installer**
   - Open the downloaded file (it ends with `.msi`)
   - Click "Next" through the installer
   - Make sure "Add to PATH" is checked (this is important!)
   - Click "Install" and wait for it to finish
   - Click "Finish"

3. **Verify Installation**
   - Open Command Prompt or PowerShell
   - Type: `node --version`
   - You should see something like `v20.x.x` or higher
   - If you see a version number, you're done!

**If `node --version` doesn't work:**
- Restart your computer (sometimes needed for PATH changes)
- Or reinstall Node.js and make sure "Add to PATH" is checked

### macOS

1. **Download Node.js**
   - Go to [nodejs.org](https://nodejs.org)
   - Click the green "LTS" button
   - This downloads the `.pkg` installer

2. **Run the Installer**
   - Open the downloaded file
   - Click "Continue" through the installer
   - Click "Install" and enter your password if prompted
   - Wait for installation to complete
   - Click "Close"

3. **Verify Installation**
   - Open Terminal (press Command+Space, type "Terminal", press Enter)
   - Type: `node --version`
   - You should see something like `v20.x.x` or higher

**Alternative: Using Homebrew (for advanced users)**
```bash
brew install node
```

### Linux (Ubuntu/Debian)

1. **Install Node.js using NodeSource**
   - Open Terminal
   - Run these commands one at a time:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Verify Installation**
   - Type: `node --version`
   - You should see something like `v20.x.x` or higher

### Linux (Fedora)

1. **Install Node.js**
   - Open Terminal
   - Run:

   ```bash
   sudo dnf install nodejs
   ```

2. **Verify Installation**
   - Type: `node --version`
   - You should see something like `v20.x.x` or higher

## Opening a Terminal

The terminal is where you'll type commands to run Newt and your bot.

### Windows

**Option 1: Command Prompt**
- Press Windows key
- Type "cmd"
- Press Enter

**Option 2: PowerShell (Recommended)**
- Press Windows key
- Type "PowerShell"
- Press Enter

**Option 3: Windows Terminal (Best)**
- Download from Microsoft Store (free)
- Gives you tabs and better features

### macOS

**Option 1: Using Spotlight**
- Press Command+Space
- Type "Terminal"
- Press Enter

**Option 2: Using Finder**
- Open Finder
- Go to Applications → Utilities
- Double-click Terminal

### Linux

**Ubuntu/Debian:**
- Press Ctrl+Alt+T
- Or search for "Terminal" in your applications menu

**Fedora:**
- Press Super key (Windows key)
- Type "Terminal"
- Press Enter

## Verifying npm

npm (Node Package Manager) comes with Node.js. You'll use it to install Newt.

**Check if npm is installed:**
```bash
npm --version
```

You should see a version number like `9.x.x` or higher. If you see this, npm is ready to use.

## Troubleshooting Installation

### "node: command not found"

**Windows:**
- Restart your computer
- Make sure you checked "Add to PATH" during installation
- Reinstall Node.js if needed

**Mac/Linux:**
- The installation might not have added Node.js to your PATH
- Try restarting your terminal
- Or reinstall using the instructions above

### "Permission denied" (Mac/Linux)

When installing, you might need sudo:
```bash
sudo apt-get install -y nodejs
```

### "Access Denied" (Windows)

- Run Command Prompt or PowerShell as Administrator
- Right-click the terminal icon
- Select "Run as administrator"

## What's Next?

Now that your computer is set up:

1. **Install Newt** - Go to the [Installation Guide](./installation.md)
2. **Create your first bot** - Follow the [Quickstart Guide](./quickstart.md)
3. **Learn the basics** - Check out [Programming Concepts](./concepts.md)

## Need Help?

If you're stuck on installation:

- Join our [Discord community](https://discord.gg/cXFCVz3VcR) for help
- Check [Node.js troubleshooting](https://nodejs.org/en/docs/)
- Search for your error message online
