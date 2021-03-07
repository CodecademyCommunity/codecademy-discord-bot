# Codecademy Discord Bot

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Every great Discord server needs a great bot. So we coded up our own. It does a lot of things that other bots do, plus has a few tailored commands.

## Current Commands

| Command          | Arguments                      | Permission     | Description                                                                                         |
| :--------------- | :----------------------------- | :------------- | :-------------------------------------------------------------------------------------------------- |
| `cc!createroles` | N/A                            | Admin          | Pulls all badges from Codecademy Discuss and creates a role for each one.                           |
| `cc!deleteroles` | N/A                            | Admin          | Deletes all the roles added from Codecademy Discuss.                                                |
| `cc!ban`         | [user] [reason]                | Admin          | Bans a user.                                                                                        |
| `cc!unban`       | [userid]                       | Admin          | Unbans a user.                                                                                      |
| `cc!tempban`     | [user] [lengthoftime] [reason] | Admin, Mod     | Temporarily bans a user for a set time period.                                                      |
| `cc!mute`        | [user] [reason]                | Admin, Mod     | Mutes a user by assigning them a _Muted_ role (denies message sending and reacting privileges).     |
| `cc!unmute`      | [user]                         | Admin, Mod, SU | Unmutes a user.                                                                                     |
| `cc!tempmute`    | [user] [lengthoftime] [reason] | Admin, Mod, SU | Temporarily mutes a user for a set time period.                                                     |
| `cc!kick`        | [user] [reason]                | Admin, Mod, SU | Kicks a user from the server.                                                                       |
| `cc!warn`        | [user] [reason]                | Admin, Mod, SU | Warns a user of an infraction and logs infraction in db.                                            |
| `cc!infractions` | [user]                         | Admin, Mod, SU | Finds user infraction record in db and returns it to channel.                                       |
| `cc!addnote`     | [user] [note]                  | Admin, Mod, SU | Adds a note to a user.                                                                              |
| `cc!sendcode`    | [username]                     | Everyone       | Sends a verification code to your Codecademy Discuss email.                                         |
| `cc!verify`      | [code]                         | Everyone       | Verifies that the code entered is valid and gives you a role for every badge you have on Discourse. |
| `cc!stats`       | N/A                            | Everyone       | Displays basic server statistics (online members, offline members, total members).                  |
| `cc!ping`        | N/A                            | Everyone       | Pong!                                                                                               |
| `cc!helpcenter`  | {plaintext}                    | Everyone       | Provides links to Codecademy's Help Center (either embedded or plaintext).                          |
| `cc!help`        | {command}                      | Everyone       | Shows information about a given command or lists all commands.                                      |

## Other Functionality

- **Logging Deleted Messages:** the bot checks when users delete their messages and creates a log of it. This hopefully helps moderating channels where users try to circumvent typical moderation by spamming and immediately deleting their messages.

- **Logging Command Usage:** the bot logs the usage of moderation commands (ban, kick, mute, etc.) and stores this information in a MySQL database.

## How to Contribute

Please refer to information in [CONTRIBUTING.md](CONTRIBUTING.md).
