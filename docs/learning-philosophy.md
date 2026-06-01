# Learning Philosophy

Newt is designed as a **curriculum disguised as a programming language**. Every feature in Newt is intentionally chosen to teach specific programming concepts progressively.

## Why Newt Exposes Internals

Unlike many beginner-friendly tools that hide complexity, Newt intentionally exposes certain system internals. This is by design:

- **Storage model** (`load user.id points`) teaches key-value storage and data persistence
- **Event handlers** teach event-driven programming
- **Loops** teach iteration and collection traversal
- **Conditionals** teach boolean logic and branching

This approach helps you understand how programming actually works, not just how to use a specific tool.

## The 5-Layer Learning Progression

Newt is structured as 5 cognitive layers, each building on the previous:

### Layer 1 — Events (Reactive Thinking)
**Concept:** Event-driven programming

```javascript
on message:
    reply "I saw your message!"
```

**What you learn:**
- Programs react to external events
- Event handlers define behavior
- Asynchronous thinking

### Layer 2 — Conditions (Logic)
**Concept:** Boolean logic and branching

```javascript
if user has role "Admin":
    reply "You have admin access"
else:
    reply "Regular user access"
```

**What you learn:**
- Boolean expressions (true/false)
- Conditional branching
- Decision-making in code

### Layer 3 — Actions (Effects)
**Concept:** Side effects and output

```javascript
reply "Hello, world!"
say "This is a message" in channel "general"
```

**What you learn:**
- Programs produce effects
- Output vs internal computation
- Action sequencing

### Layer 4 — State (Persistence)
**Concept:** Key-value storage and memory

```javascript
let points = load user.id points or 0
store user.id points points + 10
```

**What you learn:**
- Data persistence
- Memory vs runtime data
- Key-value storage patterns
- State management

### Layer 5 — Iteration (Scale Thinking)
**Concept:** Collections and loops

```javascript
for each item in ["apple", "banana", "cherry"]:
    say "I like {item}"
```

> ⚠️ **Rate Limit Warning:** Never loop through large collections like `server.members` and send a message for each item - this will hit Discord's rate limits and get your bot suspended. Only use `for each` with small, known lists.

**What you learn:**
- Collections and arrays
- Iteration patterns
- Processing multiple items
- Rate limiting awareness

## Consistency Over Simplicity

Newt prioritizes **consistent mental models** over maximum simplicity. Every feature follows the same underlying principles:

- **Explicit is better than implicit** - You see how data is stored and retrieved
- **Patterns repeat** - The same concepts apply across different contexts
- **No magic** - If something happens, you can see why in your code

This prevents the confusion of "why does this work differently here?" that plagues many beginner tools.

## From Newt to General Programming

Because Newt teaches fundamental concepts, the skills you learn transfer directly to other languages:

- **Event handlers** → JavaScript event listeners, Python callbacks
- **Conditionals** → `if/else` in any language
- **Loops** → `for/while` loops in any language
- **State management** → Databases, state management frameworks
- **Expressions** → Mathematical and logical expressions everywhere

Newt isn't just about Discord bots - it's about learning to think like a programmer.

## Learning Path

Follow this progression for the best learning experience:

1. **Start with events** - Learn how bots react to Discord
2. **Add conditions** - Make decisions based on context
3. **Take actions** - Make your bot do things
4. **Manage state** - Remember information between events
5. **Scale up** - Process multiple items with loops

Each layer builds on the previous, creating a solid foundation for programming knowledge.
