# Programming Concepts in Newt

Newt is designed to teach fundamental programming concepts through Discord bot development. Each feature in Newt maps to a specific programming concept.

## Concept Mapping

### Event-Driven Programming
**What it teaches:** Programs react to external events rather than running linearly.

**Newt features:**
- `on ready` - Initialization events
- `on command` - Command pattern events
- `on slash` - Command pattern events
- `on button click` - Interaction events
- `on select menu` - Interaction events
- `on message contains` - Pattern matching events
- `on join` - Lifecycle events
- `on leave` - Lifecycle events
- `on reaction add` - Reaction events

**Real-world parallels:**
- JavaScript event listeners (`addEventListener`)
- Python callbacks
- GUI event handling
- Web server request handling

### Boolean Logic and Branching
**What it teaches:** Making decisions based on conditions using true/false logic.

**Newt features:**
- `if / else` - Conditional statements
- Comparison operators (`=`, `!=`, `<`, `>`, `<=`, `>=`)
- Logical operators (`and`, `or`)
- `has` expression - Boolean membership check

**Real-world parallels:**
- `if/else` in any programming language
- Conditional expressions
- Guard clauses
- Decision trees

### Side Effects and Output
**What it teaches:** Programs produce effects on the external world (output, actions).

**Newt features:**
- `reply` - Send output as a response
- `say` - Send output to a specific channel
- `say embed` - Send structured output
- `say with components` - Send interactive output
- `give role` - Modify system state
- `remove role` - Modify system state
- `mute` - Modify system state
- `kick` - Modify system state
- `ban` - Modify system state

**Real-world parallels:**
- `print()` statements
- File I/O
- Network requests
- Database writes
- UI updates

### Variables and Scoping
**What it teaches:** Storing values in named containers with limited lifetime.

**Newt features:**
- `let` - Declare variables
- Variable scoping (variables exist only within their handler)

**Real-world parallels:**
- Variable declarations in any language
- Function scope
- Block scope
- Temporary storage

### Key-Value Storage and Persistence
**What it teaches:** Storing data that persists beyond program execution using key-value pairs.

**Newt features:**
- `store` - Save data to database
- `load` - Retrieve data from database
- Key-value organization (namespace + key + value)

**Real-world parallels:**
- Databases (SQL, NoSQL)
- Key-value stores (Redis, Memcached)
- File systems
- Browser localStorage

### Iteration and Collections
**What it teaches:** Processing multiple items systematically using loops.

**Newt features:**
- `for each` - Loop through collections
- `server.members` - Collection of users
- Array access (when implemented)

**Real-world parallels:**
- `for` loops in any language
- `while` loops
- Array iteration
- List processing

### String Interpolation
**What it teaches:** Embedding values within text strings.

**Newt features:**
- `{variable}` syntax in strings
- `{user.username}`, `{channel.name}`, etc.

**Real-world parallels:**
- Template literals in JavaScript
- f-strings in Python
- String formatting in any language

### Member Access
**What it teaches:** Accessing properties of objects using dot notation.

**Newt features:**
- `user.username`, `user.id`, etc.
- `channel.name`, `channel.id`, etc.
- `server.name`, `server.members`, etc.

**Real-world parallels:**
- Object property access in any language
- Struct field access
- Dictionary key access

## Learning Progression

Follow this order to build a solid foundation:

1. **Start with events** - Learn event-driven programming
2. **Add conditions** - Learn boolean logic and branching
3. **Take actions** - Learn side effects and output
4. **Manage state** - Learn variables and persistence
5. **Scale up** - Learn iteration and collections

Each concept builds on the previous, creating a coherent mental model of programming.

## Transfer to Other Languages

Because Newt teaches fundamental concepts, your knowledge transfers directly:

| Newt Concept | JavaScript | Python | General |
|--------------|------------|--------|---------|
| Event handlers | `addEventListener` | Callbacks | Event-driven patterns |
| `if / else` | `if / else` | `if / else` | Conditional logic |
| `let` | `let / const` | Variables | Variable scoping |
| `store / load` | `localStorage` | Databases | Persistence |
| `for each` | `for...of` | `for x in` | Iteration |
| `user.username` | `obj.property` | `obj.property` | Object access |

Newt isn't just about Discord bots - it's about learning to think like a programmer.
