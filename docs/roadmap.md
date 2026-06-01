# Roadmap

This page shows what features are currently implemented in Newt and what's coming soon.

## ✅ Implemented Features

### Core Functionality
- **Event Handlers:** `on ready`, `on command`, `on join`, `on leave`, `on reaction add`, `on message contains`
- **Actions:** `reply`, `say`, `give role`, `remove role`, `mute`, `kick`, `ban`, `pin`
- **Variables:** `let` for variable declaration
- **Storage:** `store` and `load` for data persistence
- **Conditionals:** `if`, `else` with `has`, `and`, `or` operators
- **Loops:** `for each` for iteration
- **String Interpolation:** `{variable}` syntax
- **Built-in Variables:** `user.*`, `message.*`, `channel.*`, `server.*`, `args`, `target`
- **REST Methods:** `getReactionUsers()`, `random()`

### Bot Configuration
- Bot name, prefix, and token configuration
- Environment variable support for tokens

## 🚧 Coming Soon

### Event Handlers
- `on slash` - Slash command support
- `on button click` - Button interaction support
- `on select menu` - Select menu interaction support
- `on message update` - Message edit events
- `on message delete` - Message delete events

### Actions
- `edit message` - Edit previously sent messages
- `delete message` - Delete messages
- `wait for` - Delay execution
- Timers (`every`, `at`, `daily`) - Scheduled tasks

### Language Features
- `true`/`false` keywords for boolean values
- Array support
- `require role` statement (use `if user has role` for now)

### Advanced Features
- File upload support
- Embed components
- More REST methods

## 📅 Planned for Future

These features are planned but not yet in development:

- Custom commands
- Webhooks
- Voice channel support
- Thread support
- Advanced permission system
- Plugin system

## 🐛 Known Limitations

### Edit/Delete Statements
The `edit` and `delete` statements have a syntax limitation - you cannot store message references from `reply` statements using `let`. This requires a language design change to fix.

### Timer System
Timers (`every`, `at`, `daily`) are not yet implemented in the interpreter runtime.

### Slash Commands
Slash commands are documented but not yet implemented in the interpreter runtime.

### Button/Select Menu Interactions
Button clicks and select menus are documented but not yet implemented in the interpreter runtime.

---

**Want to help?** Check out our [GitHub repository](https://github.com/newt-dev-sudo/newt) to contribute or open an issue for a feature you'd like to see.
