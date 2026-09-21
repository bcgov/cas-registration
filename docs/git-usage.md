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

## GitHub Merge Queue

This repository had [Merge Queues](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue#how-merge-queues-work) enabled, using [Squash & Merge](https://docs.github.com/en/pull-requests/reference/pull-request-merges#squash-and-merge-your-commits).

[Merging a pull request with a merge queue](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request-with-a-merge-queue)

The "Merge pull request" button in an approved PR is replaced with "Add to merge queue". After adding a PR to the queue, CI is run on that PR in the same way as if it were merged into `develop`. For the next X minutes, any additional PRs added will join a temporary branch in a "first in, first out" order. CI will run on these additional PRs as if they were merging into the base _plus any PRs ahead of them in the queue_. After X minutes have passed, or Y PRs have been added to the merge queue, and all CI is passed, this temporary branch merges onto the head of the `develop` branch.

If a PR in the queue fails any status checks _or_ has conflicts with the base branch it is ejected from the merge queue (with reasons given). If there are PRs behind it in the queue, they will automatically change their merge target to the next successful base (all the way up until the base `develop`) and rerun CI. When all CI is reported as successful in the queue, the queue will merge into `develop`.

### Merge Halts

If there is a "merge halt" (that is, **Lock Branch** has been enabled in the branch protection rules), PRs can still be added to the merge queue. CI will run on them as normal, they will queue as normal, but instead of merging when all CI passes (or after a certain amount of time) they will be held in queue until the branch is unlocked. When it is unlocked, the entire queued temporary branch will merge in (assuming all conditions/timers pass).
