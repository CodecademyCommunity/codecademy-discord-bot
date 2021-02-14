# Codecademy Discord Bot

Every gread Discord server needs a great bot. So we coded up our own. It does a lot of things that other bots do, plus a few tailored ones.

## Current commands

```
!createroles
```
(admin only) Pulls all badges from Codecademy Discuss and creates a role for each one.

---

```
!deleteroles
```
(admin only) Deletes all the roles added from Codecademy Discuss.

---

```
!verifycode [username]
```
Sends a verification code to your Codecademy Discuss email.

---

```
!verify [code]
```
Verifies that the code entered is valid and gives you a role for every badge you have on Discourse.

---

## Other functionality

- **Logging deleted messages:** the bot checks when users delete their messages and creates a log of it. This hopefully helps moderating channels where users try to circumvent typical moderation by spamming and immediately deleting their messages

## How to contribute

Please refer to information in [CONTRIBUTING.md](CONTRIBUTING.md)

