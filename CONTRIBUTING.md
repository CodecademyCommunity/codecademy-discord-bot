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
2. Using the HTTPS option, copy the URL.
3. Using Git Bash/Terminal/Bash, navigate to the folder where you want this repo to be located in your machine and use:
```
$ git clone pasteURLYouJustCopied
```

### Node.js and npm

1. Install Node.js; it can be downloaded from [here](https://nodejs.org/en/).
2. On the command line, navigate to the cloned repo.
3. Use the following command to install all necessary packages:
```
$ npm install
```

### Create a Discord Application and Bot

1. Head to the **Applications** section of the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Navigate to the **Bot** section and click "Add Bot". You can add an icon and name for your bot.
3. Copy the bot token and paste it into the `DISCORD_SECRET_KEY` field in your `.env` file (see below).
4. Navigate to the **OAuth2** section, check the *bot* checkbox under *Scopes*, and grant your bot the desired permissions under *Bot Permissions*.
5. Copy the URL under *Scopes*, paste it into your browser, and add your bot into your desired server.
6. You should now be able to see the bot in your server (it will appear Offline).

### dotenv

1. In the cloned repo, create a `.env` file. This will store environment variables you may want to keep secret.
2. Create a variable named `DISCORD_SECRET_KEY` and give it the value of the bot token you copied earlier.

### Set Up Database

(coming soon...)

### Run the Bot

1. Navigate to your local repo and enter the following command into your terminal:
```
node app.js
```
2. Your bot should now appear Online in your server.

## Typical Git Workflow

### Create a New Branch

1. We are treating branch "dev" as our main. You'll want to create a new branch for the issue you are contributing to.
2. Use the following to create a new branch:
```
$ git checkout -b NameOfYourNewBranch
```
3. Publish your new *local* branch to remote
```
$ git push origin NameOfYourNewBranch
```

### Work With Your Branch

1. Edit, create, and delete as you see fit. Git will keep track of the changes as long as you are in the folder where you cloned the repo.
2. You want to **add** the files you want to keep track of to the *staging area* of git. You do so with:
```
$ git add fileName
```
3. It is good practice to make a new commit every time there is significant change to the file(s) you are tracking:
```
$ git commit -m "brief description of what you did"
```
4. If this seems confusing, Codecademy has a [Git Course](https://www.codecademy.com/learn/learn-git) or check the [Git Handbook](https://guides.github.com/introduction/git-handbook/#basic-git)
5. Once you are finished with all your changes and you have used commit to add them to the staging area, **push** them to remote:
```
$ git push origin NameOfYourNewBranch
```
6. After your changes are pushed to GitHub, you can go to the repo page and create a *pull request* (PR for short) so that others can review your work and approve the changes.

### PRs

1. Once your commits are pushed to origin (the repo hosted on GitHub), you will see a new message on the site, something like "[branch name] has recent pushes" and a green button with "Compare & Pull Request". Click it.
2. On the right side you should see a menu with an option to add reviewers. Invite others to review your work! (Vic-ST and probably aedwardg)
3. Don't forget to add a meaningful commment to your PR. It should be brief and explain why your changes should be merged into the DEV branch. 
4. You can also use keywords to automatically link your PR to an open issue. [Read all about it here](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue).
5. Congrats on your contribution! Reviewers might either approve the PR and merge it, or post comments with feedback.

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