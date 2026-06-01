# Understanding Errors

This page shows common mistakes beginners make when writing Newt code, what the error messages look like, and how to fix them in plain English.

## Indentation Errors

**The Mistake:**
```newt
on command "hello":
reply "Hi there!"
```

**What's Wrong:** The `reply` line isn't indented. Newt uses indentation to show which code belongs to which handler.

**The Error Message:**
```
Error: Expected indentation on line 2
```

**How to Fix:** Add 2 or 4 spaces before `reply`:
```newt
on command "hello":
    reply "Hi there!"
```

**Rule:** Always indent the code inside your handlers (after the colon). Use 2 or 4 spaces consistently.

---

## Missing Colons

**The Mistake:**
```newt
on command "hello"
    reply "Hi there!"
```

**What's Wrong:** Missing the colon after the handler name.

**The Error Message:**
```
Error: Expected ':' after handler name on line 1
```

**How to Fix:** Add a colon:
```newt
on command "hello":
    reply "Hi there!"
```

**Rule:** Every handler (`on command`, `on ready`, `if`, etc.) needs a colon at the end.

---

## Unclosed Quotes

**The Mistake:**
```newt
on command "hello":
    reply "Hi there!
```

**What's Wrong:** The closing quote is missing.

**The Error Message:**
```
Error: Unclosed string on line 2
```

**How to Fix:** Add the closing quote:
```newt
on command "hello":
    reply "Hi there!"
```

**Rule:** Every string needs both an opening and closing quote (`"` or `'`).

---

## Using true/false Instead of 0/1

**The Mistake:**
```newt
let isAdmin = true
if isAdmin:
    reply "You are an admin"
```

**What's Wrong:** Newt doesn't support `true` and `false` keywords yet.

**The Error Message:**
```
Error: Unexpected token 'true' on line 1
```

**How to Fix:** Use `1` for true and `0` for false:
```newt
let isAdmin = 1
if isAdmin:
    reply "You are an admin"
```

**Rule:** Always use `0` for false and `1` for true in Newt.

---

## Wrong Indentation Amount

**The Mistake:**
```newt
on command "hello":
  reply "Hi there!"
    reply "How are you?"
```

**What's Wrong:** Inconsistent indentation (2 spaces then 4 spaces).

**The Error Message:**
```
Error: Inconsistent indentation on line 3
```

**How to Fix:** Use the same number of spaces throughout:
```newt
on command "hello":
    reply "Hi there!"
    reply "How are you?"
```

**Rule:** Pick either 2 or 4 spaces and use it consistently in your entire file.

---

## Missing Bot Configuration

**The Mistake:**
```newt
on command "hello":
    reply "Hi there!"
```

**What's Wrong:** No bot name, prefix, or token configuration.

**The Error Message:**
```
Error: Bot configuration missing - need bot name, prefix, and token
```

**How to Fix:** Add the required configuration at the top:
```newt
bot name "MyBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "hello":
    reply "Hi there!"
```

**Rule:** Every bot file needs at least `bot name`, `bot prefix`, and `bot token from env`.

---

## Wrong Variable Name

**The Mistake:**
```newt
on command "hello":
    reply "Hi, {username}!"
```

**What's Wrong:** Using `username` instead of `user.username`.

**The Error Message:**
```
Error: Variable 'username' not found on line 2
```

**How to Fix:** Use the correct variable name:
```newt
on command "hello":
    reply "Hi, {user.username}!"
```

**Rule:** Check the [Expressions Reference](../reference/expressions.md) for the correct variable names.

---

## Using = Instead of == in Conditions

**The Mistake:**
```newt
on command "check":
    if points = 100:
        reply "You have 100 points!"
```

**What's Wrong:** Using `=` (assignment) instead of `==` or just `=` for comparison in Newt.

**The Error Message:**
```
Error: Invalid syntax in condition on line 2
```

**How to Fix:** In Newt, use `=` for comparison:
```newt
on command "check":
    if points = 100:
        reply "You have 100 points!"
```

**Note:** Newt uses `=` for both assignment and comparison depending on context.

---

## Forgetting to Set Token

**The Mistake:**
```newt
bot token from env "DISCORD_TOKEN"
```

**What's Wrong:** The environment variable isn't set.

**The Error Message:**
```
Error: DISCORD_TOKEN environment variable not found
```

**How to Fix:** Run this in your terminal:
```bash
newt token YOUR_BOT_TOKEN
```

**Rule:** Set your token once with `newt token` before running your bot.

---

## Using Non-Implemented Features

**The Mistake:**
```newt
on slash "hello":
    reply "Hi!"
```

**What's Wrong:** Slash commands are documented but not yet implemented.

**The Error Message:**
```
Error: Handler 'on slash' not implemented
```

**How to Fix:** Use `on command` instead:
```newt
on command "hello":
    reply "Hi!"
```

**Rule:** Check the [Roadmap](../roadmap.md) to see which features are implemented.

---

## Store/Load Syntax Errors

**The Mistake:**
```newt
store user.id points 100
```

**What's Wrong:** Missing the `=` operator.

**The Error Message:**
```
Error: Expected '=' in store statement on line 1
```

**How to Fix:** Add the `=`:
```newt
store user.id points = 100
```

**Rule:** Store statements need `=` between the key and value.

---

## Mixing Tabs and Spaces

**The Mistake:**
```newt
on command "hello":
	reply "Hi there!"  # This might be a tab
    reply "How are you?"  # This is spaces
```

**What's Wrong:** Mixing tabs and spaces causes indentation errors.

**The Error Message:**
```
Error: Mixed tabs and spaces in indentation on line 3
```

**How to Fix:** Use only spaces (or only tabs) consistently:
```newt
on command "hello":
    reply "Hi there!"
    reply "How are you?"
```

**Rule:** Use spaces for indentation (2 or 4 spaces), never mix with tabs.

---

## Tips for Avoiding Errors

1. **Use `newt check`** - Run `newt check my-bot.newt` before running your bot to catch errors early
2. **Use consistent indentation** - Pick 2 or 4 spaces and stick with it
3. **Save frequently** - Save your file after changes before checking
4. **Read error messages carefully** - They usually tell you exactly what's wrong and where
5. **Check the reference** - Look at the [Language Reference](../reference/bot-config.md) for correct syntax

## Still Seeing Errors?

If you're stuck on an error:

1. **Run `newt check`** for detailed error information
2. **Check the Troubleshooting page** for common issues
3. **Ask for help** in our [Discord community](https://discord.gg/cXFCVz3VcR)
4. **Share your code** (remove sensitive data) when asking for help
