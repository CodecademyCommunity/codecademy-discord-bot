# How to Contribute to Codecademy Discord Bot

All input welcomed! Below are some of the basic steps to contribute to this project. Please read all of it to make sure you stay consistent with everybody else.

## Initial setup

(coming soon...)

## Report Issues

Please use Github's Issues. Report a bug or request a feature there!

## Typical git workflow

If you don't already, install/setup Git in your machine.

### Clone this repo

1. In the main page of the repo, notice the big green button that says "Code". Click it.
2. Using the HTTPS option, copy the URL
3. Navegate to the folder you want this repo to be in your machine and use:
```
$ git clone pasteURLYouJustCopied
```

### Create a new branch

1. We are treating branch "dev" as our main. You'll want to create a new branch for the issue you are contributing to.
2. Use the following to create a new branch:
```
$ git checkout -b NameOfYourNewBranch
```
3. Publish your new *local* branch to remote
```
$ git push origin NameOfYourNewBranch
```

### Working with your branch

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
3. Congrats on your contribution! Reviewers might either approve the PR and merge it, or post comments with feedback.

### Clean up

1. Typically, we want to use one branch per issue. That means that once your PR is complete, you should delete the branch (and create a new one if there is another issue you want to work on)
2. Delete the branch on remote with:
```
$ git push origin --delete NameOfTheBranch
```
3. Now delete the branch *locally* (remember, you cloned the remote repo to your machine. That means they are effectively different):
```
$ git branch -d NameOfTheBranch
```
