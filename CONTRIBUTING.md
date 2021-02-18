# How to Contribute to Codecademy Discord Bot

All input welcomed! Below are some of the basic steps to contribute to this project. Please read all of it to make sure you stay consistent with everybody else.

Please review the *issues* tab and self-assign one if you want to try to help in those. This keeps the efforts tidy and we know who is working on what.

## Table of contents

* [Initial Setup](#initial-setup)
* [Typical Git Workflow](#typical-git-workflow)
* [Report Issues](#report-issues)

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

1. In the cloned repo, create a file named `.env`. This will store environment variables you may want to keep secret.
2. Create a variable named `DISCORD_SECRET_KEY` (you will assign this a value later on).

### Set Up Database

(coming soon...)

### Create a Discord Application and Bot

1. Head to the **Applications** section of the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Navigate to the **Bot** section and click "Add Bot". You can add an icon and name for your bot.
3. Copy the bot token and paste it into the `DISCORD_SECRET_KEY` field in your `.env` file.
4. Navigate to the **OAuth2** section, check the *bot* checkbox under *Scopes*, and grant your bot the desired permissions under *Bot Permissions*.
5. Copy the URL under *Scopes*, paste it into your browser, and add your bot into your desired server.
6. You should now be able to see the bot in your server (it will appear Offline).

### Run the Bot

1. Navigate to your local repo and enter the following command into your terminal:
```
$ npm start
```
2. Your bot should now appear Online in your server.

## Repository Git Workflow
We use a typical Git branching workflow. If you are new to Git and GitHub, visit our [Git Workflow wiki page](https://github.com/CodecademyCommunity/codecademy-discord-bot/wiki/Git-Workflow) for a quick-start guide!

### Clean Up

1. Typically, we want to use one branch per issue. That means that once your PR is merged into the `dev` branch, you should delete the branch (and create a new one if there is another issue you want to work on).
2. As you cannot delete the branch you are currently on, navigate to another branch. For example, the following command will switch your current branch to `dev`:
```
$ git checkout dev
```
3. Delete the branch on remote with:
```
$ git push origin --delete NameOfTheBranch
```
4. Now delete the branch *locally* (remember, you cloned the remote repo to your machine. That means they are effectively different):
```
$ git branch -d NameOfTheBranch
```

## Report Issues

Please use Github's Issues. Report a bug or request a feature there. Please do:
* Use an appropriate label for the issue. If you think the current labels don't apply, create a new one
* Don't forget to add your issue to the project Kanban board
* If it is a bug: describe the bug and how to reproduce it
* If it is a feature request: explain the idea, how you think it could be done and what need it is addressing