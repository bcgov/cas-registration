# How we use Git on the Digital Services Team

## Branching

**Develop**
The develop branch is our working branch. This is the branch off of which all pull requests are based & merged back into once complete. The code in this branch is deployed to our develoment environment in openshift.

**Main**
The main branch is our "live" code branch. It is the state of the code that is deployed to our production (and test) environment. No pull requests should be made off of this branch. Once a release is ready in the develop branch, the develop branch is merged with --ff-only (fast forward) flag.

## Rebase vs Merge

We use rebase over merge when syncing our pull requests with the code in the develop branch. This is to preserve a clean & linear git history that is easier to read & walk through how we got to the head. Merging creates alternate timelines which complicates the history and can prove problematic if we need to fix something in git history manually.

## Conventional Commits

This project follows the commit message conventions outlined by [Convential Commits](https://www.conventionalcommits.org/). Besides the standard commit types (message prefixes) **feat** and **fix**, we use some other types described there based on the Angular convention; some common ones among those are **test**, **docs**, **chore** and **refactor**.

Some rules for following these conventions:

- All commits need to start with one of the above message prefixes
- Only _one_ **feat** or **fix** prefixed commit per pull request is recommended. All commits prefixed by **feat** or **fix** will end up in the changelog. One commit describing what the feature or fix being implement is should be sufficient. Too many of these in one chunk of work will pollute the changelog.

These facilitate the automated creation of [changelogs](../CHANGELOG.md), using the [release-it](https://github.com/release-it/release-it) conventional-changelog package.
