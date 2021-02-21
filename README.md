# Codecademy Discord Bot

Every great Discord server needs a great bot. So we coded up our own. It does a lot of things that other bots do, plus has a few tailored commands.

## Current Commands

```
cc!createroles
```
(admin only) Pulls all badges from Codecademy Discuss and creates a role for each one.

---

```
cc!deleteroles
```
(admin only) Deletes all the roles added from Codecademy Discuss.

---

```
cc!sendcode [username]
```
Sends a verification code to your Codecademy Discuss email.

---

```
cc!verify [code]
```
Verifies that the code entered is valid and gives you a role for every badge you have on Discourse.

---

```
cc!stats
```
Displays basic server statistics (online members, offline members, total members).

---

```
cc!ping
```
Pong!

---

```
cc!ban [user] [reason]
```
Bans a user.

---

```
cc!unban [user]
```
Unbans a user.

---

```
cc!tempban [user] [lengthoftime] [reason]
```
Temporarily bans a user for a set time period.

---

```
cc!kick [user] [reason]
```
Kicks a user from the server.

---

```
cc!mute [user] [reason]
```
Mutes a user by assigning them a *Muted* role (denies message sending and reacting privileges).

---

```
cc!unmute [user]
```
Unmutes a user.

---

```
cc!tempmute [user] [lengthoftime] [reason]
```
Temporarily mutes a user for a set time period.

---

## Other Functionality

* **Logging Deleted Messages:** the bot checks when users delete their messages and creates a log of it. This hopefully helps moderating channels where users try to circumvent typical moderation by spamming and immediately deleting their messages.

* **Logging Command Usage:** the bot logs the usage of moderation commands (ban, kick, mute, etc.) and stores this information in a MySQL database.

## How to Contribute

Please refer to information in [CONTRIBUTING.md](CONTRIBUTING.md).
