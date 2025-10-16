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
1. go into the github settings and turn off merging to develop so no one can merge by accident if they miss the merge halt post. (Optional, but this ensures no other changes are made to the `develop` branch while the release is in progress. Release PRs can't be rebased (see note below), so if someone does merge something in, you have to restart the release.)
1. on `develop`, check migrations against prod data. Ideally, do this using the dag:

   1. go to the cas-airflow-test frontend and trigger the `cas_bciers_test_migrations` dag. You will need the source (where the database backup originates from, likely `abc123-prod`) and target (where to deploy the tests, (`abc123-test`)) namespaces, as well as the git hash of the commit with a backend image built that you want to test (used by `BACKEND_CHART_TAG`).
   1. Ensure the dag completes successfully. If any steps fail, the helm charts remain deployed in the target namespace for later inspection. If there are any problems with the migrations, create a branch, fix, and merge the fix before continuing.

1. If the dag is not available, this can be done manually:

   1. in your .env, remove/comment out CHES variables (they should automatically be removed by the script but better safe than sorry) and add prod variables (see 1password)
   1. `poetry run python manage.py check_migrations_with_prod_data --pod-name {pod_name}` (replace {pod_name} with the name of the production Postgres pod (not the leader node)).
      If there are any problems with the migrations, create a branch, fix, and merge the fix before continuing.

1. create a `chore/release` branch and create the upstream
1. reset database with `make reset_db` (from `cas-registration/bc_obps`) for proper creation of migration files
1. run `make release` (from `cas-registration`) and follow the prompts - This will:
   - Create empty migration files for each django app based on the release version
   - bump the version number
   - generate a change log
1. create a pull request and confirm all the migrations have been created (at the time of writing, one for each of registration, reporting, common, RLS, and task-scheduler)
1. once the pull request is approved, if you disabled merging to `develop`, temporarily re-enable merging so you can merge the release PR, and then disable merging again
1. wait for the required checks on the merge commit to pass (note: check-migrations will fail until https://github.com/bcgov/cas-registration/issues/3590 is completed)
1. update your local develop branch and fast-forward the `main` branch using:

```bash
- git checkout main
- git merge develop --ff-only
- git push
```

1. tag github tickets with the release version if applicable (see the team_release_process.md for more details)
1. once the release has been deployed to the desired environment, post in the Teams Developers channel that the merge halt is over

**Do not rebase release PRs**. If a release PR falls behind the develop branch, a new PR will need to be created. `release-it` relies on tags to make comparisons from one release to another. Rebasing makes the tag created during the release process unreachable by [git describe](https://git-scm.com/docs/git-describe), which is what `release-it` uses to determine the parent tag.
