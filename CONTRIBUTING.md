# How to Codecademy Discord Bot

All input welcomed! Below are some of the basic steps to contribute to this project

## Initial setup

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

