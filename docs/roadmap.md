# Roadmap

This page shows what features are currently implemented in Newt and what's coming soon.

## ✅ Implemented Features

### Core Functionality
- **Event Handlers:** `on ready`, `on command`, `on join`, `on leave`, `on reaction add`, `on remove reaction`, `on member update`, `on presence update`, `on message contains`, `on slash`, `on button click`, `on select menu`, `on modal submit`, `on message update`, `on message delete`
- **Actions:** `reply`, `reply ephemeral`, `say`, `say embed`, `say with components`, `show modal`, `give role`, `remove role`, `mute`, `kick`, `ban`, `unban`, `edit message`, `delete message`, `wait for`, `pin message`, `unpin message`, `add reaction`, `remove reaction`, `clear reactions`, `create role`, `delete role`, `edit role`, `dm send`
- **Variables:** `let` for variable declaration with boolean values (`true`, `false`)
- **Storage:** `store` and `load` for data persistence
- **Conditionals:** `if`, `else` with `has`, `and`, `or` operators
- **Loops:** `for each` for iteration
- **Timers:** `every`, `at daily` for scheduled tasks
- **String Interpolation:** `{variable}` syntax
- **Built-in Variables:** `user.*`, `message.*`, `channel.*`, `server.*`, `args`, `target`, `values`, `fields`
- **REST Methods:** `getReactionUsers()`, `random()`
- **Components:** Buttons (primary, secondary, success, danger, link), Select menus (string, channel, role, user, mentionable), Modals with text inputs
- **Embeds:** Enhanced with author, footer, image, thumbnail, URL, timestamp

### Bot Configuration
- Bot name, prefix, and token configuration
- Environment variable support for tokens

## 🚧 Coming Soon

### Language Features
- Array support

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

---

**Want to help?** Check out our [GitHub repository](https://github.com/newt-dev-sudo/newt) to contribute or open an issue for a feature you'd like to see.
