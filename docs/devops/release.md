## Release Process

To facilitate identification of the changes that are released and communication around them, we want to:

- bump the version number, following [semantic versioning](https://semver.org/). If you want to override the version number, which is automatically determined based on the conventional commit messages being released, you can do so by passing a parameter to the `release-it` command, e.g.

```bash
yarn release-it 1.0.0-rc.1
```

- generate a change log, based on the commit messages using the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format

To make this process easy, we use [`release-it`](https://github.com/release-it/release-it).

When you're ready to make a release, apply the following steps:

1. post in the Teams developers channel that you're doing a release and there's a merge halt on
2. go into the github settings and turn off merging to develop so no one can merge by accident if they miss the merge halt post. (Optional, but this ensures no other changes are made to the `develop` branch while the release is in progress. Release PRs can't be rebased (see note below), so if someone does merge something in, you have to restart the release.)
3. create a `chore/release` branch and create the upstream
4. reset database with `make reset_db` (from `cas-registration/bc_obps`) for proper creation of migration files
5. run `make release` (from `cas-registration`) and follow the prompts - This will:
   - Create empty migration files for each django app based on the release version
   - bump the version number
   - generate a change log
6. create a pull request and confirm all the migrations have been created (at the time of writing, one for each of registration, reporting, common, and RLS)
7. once the pull request is approved, if you disabled merging to `develop`, temporarily re-enable merging so you can merge the release PR, and then disable merging again
8. once all required checks on the merge commit have passed:

- update your local develop branch
- fast-forward the `main` branch using:

```bash
- git checkout main
- git merge develop --ff-only
- git push
```

8. tag github tickets with the release version if applicable (see the team_release_process.md for more details)
9. once the release has been deployed to the desired environment, post in the Teams Developers channel that the merge halt is over

**Do not rebase release PRs**. If a release PR falls behind the develop branch, a new PR will need to be created. `release-it` relies on tags to make comparisons from one release to another. Rebasing makes the tag created during the release process unreachable by [git describe](https://git-scm.com/docs/git-describe), which is what `release-it` uses to determine the parent tag.
