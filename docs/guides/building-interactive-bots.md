# Building Interactive Bots

Learn how to create bots with buttons, select menus, and modals for rich user interactions.

## Buttons

Buttons allow users to interact with your bot through clickable elements.

### Basic Button

```newt
on command "poll":
    say with components "Vote now!":
        button "yes" label "Yes"
        button "no" label "No"

on button click "yes":
    reply "You voted yes!"

on button click "no":
    reply "You voted no!"
```

### Button Styles

```newt
on command "styles":
    say with components "Button styles:":
        button "primary" label "Primary" style "primary"
        button "success" label "Success" style "success"
        button "danger" label "Danger" style "danger"
        button "secondary" label "Secondary" style "secondary"
        button "link" label "Visit Site" style "link" url "https://example.com"
```

## Select Menus

Select menus allow users to choose from a list of options.

### Basic Select Menu

```newt
on command "role":
    say with components "Select a role:":
        select menu "role_select" with options:
            "Admin" as "admin"
            "Moderator" as "mod"
            "Member" as "member"

on menu "role_select":
    reply "You selected: {values[0]}"
```

### Advanced Select Menu Types

```newt
# Channel selection
on command "channel":
    say with components "Select a channel:":
        select menu "channel_select" type "channel" with options:
            "General" as "general"
            "Announcements" as "announcements"

# User selection
on command "user":
    say with components "Select a user:":
        select menu "user_select" type "user" with options:
            "User 1" as "user1"
            "User 2" as "user2"

# Role selection
on command "role":
    say with components "Select a role:":
        select menu "role_select" type "role" with options:
            "Admin" as "admin"
            "Moderator" as "mod"
```

## Modals

Modals are popup forms for collecting structured user input.

### Basic Modal

```newt
on command "feedback":
    show modal "feedback" title "Feedback":
        input "name" label "Your Name"
        input "message" label "Your Message" style "paragraph" required

on modal submit "feedback":
    reply "Thanks {inputs.name}! Your feedback: {inputs.message}"
```

### Modal with Multiple Inputs

```newt
on command "signup":
    show modal "signup" title "Sign Up":
        input "username" label "Username" required
        input "email" label "Email" required
        input "bio" label "Bio" style "paragraph"

on modal submit "signup":
    reply "Welcome {inputs.username}! Email: {inputs.email}"
```

## Combining Components

You can combine buttons and select menus in a single message:

```newt
on command "actions":
    say with components "Choose an action:":
        button "approve" label "Approve" style "success"
        button "reject" label "Reject" style "danger"
        select menu "priority" with options:
            "High" as "high"
            "Medium" as "medium"
            "Low" as "low"
```

## Best Practices

- **Use descriptive IDs**: Make button and menu IDs clear and meaningful
- **Provide feedback**: Always reply to user interactions
- **Handle errors**: Use try-catch around interactive operations
- **Keep it simple**: Don't overwhelm users with too many options at once

## Related Documentation

- [Statements Reference](../reference/statements.md) - Full syntax for components
- [Handlers Reference](../reference/handlers.md) - Event handlers for interactions
- [Expressions Reference](../reference/expressions.md) - Working with user input
