## Release Process

To facilitate identification of the changes that are released and communication around them, we want to:

- bump the version number, following [semantic versioning](https://semver.org/)
- generate a change log, based on the commit messages using the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format

To make this process easy, we use [`release-it`](https://github.com/release-it/release-it).

When you're ready to make a release, apply the following steps:

1. create a `chore/release` branch
2. reset database with `make reset_db` for proper creation of migration files
3. run `make release` and follow the prompts - This will:
   - Create empty migration files for each django app based on the release version
   - bump the version number
   - generate a change log
4. create a pull request
5. once the pull request is approved and merged, and all required checks on the merge commit have passed, update your local develop branch and fast-forward the `main` branch using:

```bash
- git checkout main
- git merge develop --ff-only
- git push
```

**_Note_**:make sure no other changes are made to the `develop` branch while the release is in progress.

If you want to override the version number, which is automatically determined based on the conventional commit messages being released, you can do so by passing a parameter to the `release-it` command, e.g.

```bash
yarn release-it 1.0.0-rc.1
```

**Do not rebase release PRs**. If a release PR falls behind the develop branch, a new PR will need to be created. `release-it` relies on tags to make comparisons from one release to another. Rebasing makes the tag created during the release process unreachable by [git describe](https://git-scm.com/docs/git-describe), which is what `release-it` uses to determine the parent tag.
