# Ticket System

A ticket system bot that lets users create support tickets using buttons.

```newt
bot name "TicketBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on slash "ticket":
    say with components "Click below to create a support ticket:":
        button "create_ticket" label "Create Ticket"

on button click "create_ticket":
    create channel "ticket-{user.id}" in category "Tickets"
    say "Ticket created for {user.mention}" in channel "ticket-{user.id}"
    give user role "Ticket Owner"
    reply "Your ticket has been created!"

on command "close":
    if channel.name starts with "ticket-":
        reply "Closing this ticket..."
        wait 5 seconds
        delete channel
    else:
        reply "This command can only be used in ticket channels"
```

**What this does:**
- `/ticket` - Shows a button to create a support ticket
- Clicking "Create Ticket" - Creates a private channel for the user
- `!close` - Closes and deletes the ticket channel (only works in ticket channels)

**Features:**
- Button-based ticket creation
- Automatic channel naming with user ID
- Role assignment for ticket owners
- Close command with delay for confirmation
