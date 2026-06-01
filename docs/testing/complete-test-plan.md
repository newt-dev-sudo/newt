# Complete Feature Testing Plan

This document provides a comprehensive testing plan for all Newt interpreter features.

## Setup

1. Save your Discord token:
   ```bash
   newt token YOUR_BOT_TOKEN
   ```

2. Run the test bot:
   ```bash
   node packages/cli/dist/src/index.js run examples/full-test.newt
   ```

## Tested Features (✅ Working)

### 1. Ready Handler
**Command:** None (automatic on bot start)
**Expected:** Bot comes online with activity "Testing all features"
**Status:** ✅ Working

### 2. Reply Statement
**Command:** `!test-reply`
**Expected:** Bot replies "This is a reply test"
**Status:** ✅ Working

### 3. Say Statement
**Command:** `!test-say`
**Expected:** Bot sends "This is a say test" to current channel
**Status:** ✅ Working

### 4. Let Statement & Variables
**Command:** `!test-let`
**Expected:** Bot replies "Hello, [your username]!"
**Status:** ✅ Working

### 5. Store Statement
**Command:** `!test-store`
**Expected:** Bot replies "Data stored"
**Status:** ✅ Working

### 6. Load Statement
**Command:** `!test-load`
**Expected:** Bot replies "Loaded: [points value]"
**Status:** ✅ Working

### 7. REST Method - getUser
**Command:** `!test-getuser @mention_a_user`
**Expected:** Bot replies "User: [username]"
**Error case:** If no user mentioned, replies "Mention a user first"
**Status:** ✅ Working

### 8. REST Method - getGuild
**Command:** `!test-getguild`
**Expected:** Bot replies "Guild: [server name]"
**Status:** ✅ Working

### 9. Error Handling
**Command:** `!test-error`
**Expected:** Bot replies "Error caught successfully"
**Status:** ✅ Working

### 10. Set Activity
**Command:** `!test-activity`
**Expected:** Bot replies "Activity set" and bot activity changes to "Custom activity"
**Status:** ✅ Working

### 11. Fetch Expression
**Command:** `!test-fetch`
**Expected:** Bot replies "Fetch successful"
**Status:** ✅ Working

## Features to Test (⚠️ Implemented but untested)

### 12. If/Else Statements
**Test file:** Add to `full-test.newt`
```newt
on command "test-if":
    let points = load user.id points or 0
    if points > 0:
        reply "You have points"
    else:
        reply "No points yet"
```
**Command:** `!test-if`
**Expected:** 
- First run: "No points yet" (points = 0)
- After `!test-store`: "You have points" (points > 0)
**Status:** ⚠️ Needs testing

### 13. For Each Loops
**Test file:** Add to `full-test.newt`
```newt
on command "test-loop":
    for each member in server.members:
        say "Member: {member.username}" in channel "general"
```
**Command:** `!test-loop`
**Expected:** Bot sends messages for each member to #general channel
**Note:** Requires channel named "general"
**Status:** ⚠️ Needs testing

### 14. Message Editing
**Test file:** Add to `full-test.newt`
```newt
on command "test-edit":
    let botMessage = reply "Original message"
    wait for 2 seconds
    edit botMessage to "Edited message"
```
**Command:** `!test-edit`
**Expected:** 
- Bot replies "Original message"
- After 2 seconds, message changes to "Edited message"
**Status:** ⚠️ Needs testing

### 15. Message Deletion
**Test file:** Add to `full-test.newt`
```newt
on command "test-delete":
    let botMessage = reply "This will be deleted"
    wait for 2 seconds
    delete botMessage
```
**Command:** `!test-delete`
**Expected:** 
- Bot replies "This will be deleted"
- After 2 seconds, message is deleted
**Status:** ⚠️ Needs testing

### 16. File Upload
**Test file:** Add to `full-test.newt`
```newt
on command "test-upload":
    upload "./test.txt" with message "Here's a file"
```
**Prerequisite:** Create `test.txt` in the newt directory
**Command:** `!test-upload`
**Expected:** Bot uploads test.txt with message "Here's a file"
**Status:** ⚠️ Needs testing

### 17. Message Update Handler
**Test file:** Add to `full-test.newt`
```newt
on message update:
    reply "I noticed you edited a message!"
```
**Test:** 
- Send any message
- Edit that message
**Expected:** Bot replies "I noticed you edited a message!"
**Status:** ⚠️ Needs testing

### 18. Message Delete Handler
**Test file:** Add to `full-test.newt`
```newt
on message delete:
    reply "I noticed a message was deleted!"
```
**Test:** 
- Send any message
- Delete that message
**Expected:** Bot replies "I noticed a message was deleted!"
**Status:** ⚠️ Needs testing

### 19. Join Handler
**Test file:** Add to `full-test.newt`
```newt
on join:
    say "Welcome to the server!" in channel "general"
```
**Test:** Have a user join the server
**Expected:** Bot sends "Welcome to the server!" to #general
**Note:** Requires channel named "general"
**Status:** ⚠️ Needs testing

### 20. Leave Handler
**Test file:** Add to `full-test.newt`
```newt
on leave:
    say "Goodbye!" in channel "general"
```
**Test:** Have a user leave the server
**Expected:** Bot sends "Goodbye!" to #general
**Note:** Requires channel named "general"
**Status:** ⚠️ Needs testing

## Testing Checklist

- [ ] Ready Handler
- [ ] Reply Statement
- [ ] Say Statement
- [ ] Let Statement & Variables
- [ ] Store Statement
- [ ] Load Statement
- [ ] REST Method - getUser
- [ ] REST Method - getGuild
- [ ] Error Handling
- [ ] Set Activity
- [ ] Fetch Expression
- [ ] If/Else Statements
- [ ] For Each Loops
- [ ] Message Editing
- [ ] Message Deletion
- [ ] File Upload
- [ ] Message Update Handler
- [ ] Message Delete Handler
- [ ] Join Handler
- [ ] Leave Handler

## Test Results Template

After testing each feature, update this section:

| Feature | Status | Notes |
|---------|--------|-------|
| Ready Handler | ✅ | Working |
| Reply Statement | ✅ | Working |
| Say Statement | ✅ | Working |
| Let Statement | ✅ | Working |
| Store Statement | ✅ | Working |
| Load Statement | ✅ | Working |
| getUser | ✅ | Working |
| getGuild | ✅ | Working |
| Error Handling | ✅ | Working |
| Set Activity | ✅ | Working |
| Fetch Expression | ✅ | Working |
| If/Else Statements | ⚠️ | To test |
| For Each Loops | ⚠️ | To test |
| Message Editing | ⚠️ | To test |
| Message Deletion | ⚠️ | To test |
| File Upload | ⚠️ | To test |
| Message Update Handler | ⚠️ | To test |
| Message Delete Handler | ⚠️ | To test |
| Join Handler | ⚠️ | To test |
| Leave Handler | ⚠️ | To test |
