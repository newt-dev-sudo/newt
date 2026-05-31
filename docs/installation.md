# Installation

Install Newt on your system to start building Discord bots.

## Prerequisites

- **Node.js 20 or higher** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- A text editor (VS Code recommended)

## Global Installation

Install Newt globally to use the `newt` command from anywhere:

```bash
npm install -g @newt-dev/cli
```

### Verify Installation

```bash
newt --version
```

You should see version information.

### Troubleshooting Global Install

**Permission denied (Linux/Mac):**
```bash
sudo npm install -g newt-lang
```

**Command not found (Windows):**
- Restart your terminal
- Check that npm global bin is in your PATH
- Run `npm config get prefix` to see where packages are installed

## Local Installation

Install Newt in a specific project:

```bash
npm install @newt-dev/cli
```

Then use it via npx:
```bash
npx newt check my-bot.newt
```

## Development Installation

For contributing to Newt:

```bash
git clone https://github.com/newt-lang/newt.git
cd newt
npm install
npm run build
```

## Editor Setup

### VS Code

1. Install the [Newt Language Support](https://marketplace.visualstudio.com/items?itemName=newt-lang.newt) extension
2. Syntax highlighting and error detection will be enabled automatically

### Other Editors

Newt files use the `.newt` extension. Configure your editor to treat them as plain text or use generic syntax highlighting.

## System Requirements

### Operating Systems

- **Windows** - Windows 10 or later
- **macOS** - macOS 10.15 or later
- **Linux** - Any modern distribution

### Hardware

- **RAM:** 512MB minimum
- **Disk:** 100MB for installation
- **Network:** Required for npm installation and Discord connectivity

## Upgrading

To upgrade to the latest version:

```bash
npm update -g @newt-dev/cli
```

## Uninstalling

To remove Newt from your system:

```bash
npm uninstall -g @newt-dev/cli
```

## Next Steps

- [Quickstart Guide](./quickstart.md) - Build your first bot
- [Token Security](./security.md) - Secure your bot tokens
- [Language Reference](./reference/bot-config.md) - Learn the language
