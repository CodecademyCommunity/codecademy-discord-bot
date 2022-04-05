# How to Contribute to Codecademy Discord Bot

All input welcomed! Below are some of the basic steps to contribute to this project. Please read all of it to make sure you stay consistent with everybody else.

Please review the _issues_ tab and self-assign one if you want to try to help in those. This keeps the efforts tidy and we know who is working on what.

## Table of contents

- [Initial Setup](#initial-setup)
- [Advanced Setup](#advanced-setup-optional) (optional)
- [Typical Git Workflow](#repository-git-workflow)
- [Report Issues](#report-issues)

## Initial Setup

If you don't have it already, install/setup Git on your machine.

### Clone This Repo

1. In the main page of the repo, notice the big green button that says "Code". Click it.
2. Using the HTTPS or SSH option, copy the URL.
3. If you are using HTTPS, using Git Bash/Terminal/Bash, navigate to the folder where you want this repo to be located in your machine and use:

```
$ git clone pasteURLYouJustCopied
```

4. If you are using SSH, follow this [GitHub tutorial](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh).

### Node.js and npm

1. Install Node.js; it can be downloaded from [here](https://nodejs.org/en/).
2. On the command line, navigate to the cloned repo.
3. Use the following command to install all necessary packages:

```
$ npm install
```

### Add Secret Keys

1. The cloned repo includes a file named sample.env which contain the environmental variables. Copy this file to another file named .env by running the command below in the project main directory. Several of these variables need to be kept secret so this file is not commited to github.
   `cp sample.env .env`
2. Replace the sample values for the environmental variables in the .env file with values you obtain from the Discord Developer Portal, your local database connection, and Discord IDs associated with roles and channels in the development Discord server.
   The instructions below describe how the variable values are obtained.

### Set Up Database

Visit our [wiki page](https://github.com/CodecademyCommunity/codecademy-discord-bot/wiki/Database-stuff) for detailed instructions on getting your local database set up for testing and development.

### Create a Discord Application and Bot

1. Head to the **Applications** section of the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Navigate to the **Bot** section and click "Add Bot". You can add an icon and name for your bot.
3. Copy the bot token and paste it into the `DISCORD_SECRET_KEY` field in your `.env` file.
4. Navigate to the **OAuth2** section, check the _bot_ checkbox under _Scopes_, and grant your bot the desired permissions under _Bot Permissions_.
5. Copy the URL under _Scopes_, paste it into your browser, and add your bot into your desired server.
6. Find the `CLIENT_ID` on the Discord Developer portal OAuth2 page and copy in into your .env file.
7. Enter the `GUILD_ID` in the .env. You find it in the Discord server by right-clicking on the server name and selecting Copy ID.
8. Enter the `ID_ADMIN`, `ID_CODE_COUNSELOR`, `ID_MODERATOR`, `ID_SUPER_ADMIN` values into the .env. They can be found in the Discord server settings - Roles. The values are the IDs for the respective roles.
9. Enter the `BOT_ERROR_CHANNEL_ID` variable. For development you can get the ID for the the #bot-errors channel by right-clicking on the channel in Discord and selecting Copy ID.
10. You should now be able to see the bot in your server (it will appear Offline).

### Run the Bot

1. Navigate to your local repo and enter the following command into your terminal:

```
$ npm start
```

2. Your bot should now appear Online in your server.

## Advanced Setup (optional)

For information about our pre-commit hook and setting up your local environment to use ESLint, Prettier and Git Blame, check out the [Advanced Setup page](https://github.com/CodecademyCommunity/codecademy-discord-bot/wiki/Advanced-Setup) of our wiki.

## Repository Git Workflow

We use a typical Git branching workflow. If you are new to Git and GitHub, visit our [Git Workflow wiki page](https://github.com/CodecademyCommunity/codecademy-discord-bot/wiki/Git-Workflow) for a quick-start guide!

## Report Issues

Please use Github's Issues. Report a bug or request a feature there. Please do:

- Use an appropriate label for the issue. If you think the current labels don't apply, create a new one
- Don't forget to add your issue to the project Kanban board
- If it is a bug: describe the bug and how to reproduce it
- If it is a feature request: explain the idea, how you think it could be done and what need it is addressing
