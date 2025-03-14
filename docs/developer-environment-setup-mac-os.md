# Setting up and using the Local Development Environment

## Prerequisites

Ensure the following are installed:

- [Postgres](https://www.postgresql.org/)
- [asdf](https://asdf-vm.com/)

## Repository and Version Control

- Ensure you have push access (most likely by being added to the **@bcgov/cas-developers** GitHub team) to [bcgov/cas-cif](https://github.com/bcgov/cas-cif).
- Ensure you have [GPG commit signing](https://docs.github.com/en/github/authenticating-to-github/signing-commits) set up on your local environment.
  - First, ensure your `git config user.email` is set to the email address you want to use for signing.
  - You can verify it's working when you commit to a branch and the signature is indicated by `git log --show-signature`. Once pushed, a "Verified" badge appears next to your commits on GitHub.
- Clone a local copy of [bcgov/cas-registration](https://github.com/bcgov/cas-registration).

## App Environment Variables

In `bc_obps` directory, create a `bc_obps/.env` file from the `bc_obps/.env.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bc_obps/.env` values in document `OBPS backend ENV`.

In `bciers` directory, create a `bciers/.env` file from the `bciers/.env.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bciers/.env` values in document `OBPS FE env`.

In `bciers` directory, create a `bciers/.env.local` file from the `bciers/.env.local.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bciers/.env.local` values in document `OBPS FE env.local`.

In `bciers/apps/registration1/e2e` directory, create a `bciers/apps/registration1/e2e/.env.local` file from the `bciers/apps/registration1/e2e/.env.local.example` file. See `bciers/apps/registration1/e2e/.env.local` file for directions to the 1password values.

In `bciers/apps/registration/e2e` directory, create a `bciers/apps//e2e/.env.local` file from the `bciers/apps/registration/e2e/.env.local.example` file. See `bciers/apps/registration/e2e/.env.local` file for directions to the 1password values.

## Backend Environment Setup

1. Navigate to folder: `cas-registration/bc_obps`.
2. Copy/Paste the `.env.example` file and rename it `.env`.
3. Complete the .env file values reflecting the 1Password vault document `OBPS backend ENV`.
4. Download 1Password vault file `OBPS GCS json` and store it in folder location detailed in `.env\GOOGLE_APPLICATION_CREDENTIALS`.
5. From the terminal, cd into directory `cas-registration/bc_obps`.
6. Run `make install_dev_tools`. This will install asdf plugins, poetry and activate the poetry virtual environment (to get into the environment again after setup, run `poetry env activate`). To exit the virtual env run `deactivate`.
7. Run `make install_poetry_deps` to install all python dependencies.
8. Run `make start_pg` to start the postgres server if it is not already running.
9. Run `make create_db` to create the database.
10. Run `make migrate` to run all database migrations.
11. Run `make run`, which will start running the development server locally (default port is :8000; terminal output will indicate what localhost address to use to access the backend. server).

    - to test it out, navigate to the `/api/docs` endpoint in your browser, you should see documentation for the /add endpoint
    - navigate to the `api/add?a=4&b=2` endpoint in your browser, which should return as a result the sum of the specified values for a and b.

12. Optional: to test the Django server's connection to your database, run `python3 manage.py check --database default`.
13. Optional: to load mock data via fixtures, run `make loadfixtures`.

## Backend Environment Use

After doing the initial setup, to get the backend re-running:

1. To set up the database:
   - If you want to drop and recreate the database with mock data, run `make reset_db`. (Warning: This will delete superusers and you will have to recreate with `make superuser`.)
   - If you want to keep your existing database and update (e.g. after a rebase)
     - If there are new migrations, run `make migrate`. (Or, because we're pre-production, you can delete the existing migrations, run `make migrations` and then `make migrate`)
     - If there are new fixtures, `run python manage.py loaddata <path-to-fixture>``
2. Run `make run`

### Troubleshooting

- There might be an error where postgres is only installed with the `postgres` user and not your local user.
  To address this, in a terminal, enter:

```bash
$> sudo -u postgres createuser -s -i -d -r -l -w <<your_local_user>>
$> sudo -u postgres createdb <<your_local_user>>
```

- if running poetry commands throws errors about the `_hashlib` library, [try these troubleshooting commands](https://github.com/python-poetry/poetry/issues/7695#issuecomment-1572825140)

- if you encounter an issue installing `psycopg2` relating to `Error: pg_config --libdir failed: No version is set for command pg_config`, try setting your Postgres version for asdf globally rather than locally. (E.g., `asdf global postgres 14.0`)

- if your admin panel looks ugly, run `python3 manage.py collectstatic` to collect static files and then try again.

## Monorepo frontend environment setup

**See the [Nx Monorepo readme](./nx-monorepo.md) for more information.**

### First time setup

In the `bciers` directory:

1. To enable [Corepack](https://nodejs.org/docs/latest-v20.x/api/corepack.html), in order to use Yarn Modern: `corepack enable`.
2. To install all Monorepo dependencies: `yarn install`.
3. **Optional**: Run `npm add --global nx@18.2.1` to install `nx` globally. This global instance will use to the project version if it differs.

### See the [Nx Monorepo](./nx-monorepo.md) readme for more information

### Development server

1. To run a development server, you can use `yarn nx run {project}:dev`, with `{project}` being the frontend project you are working on. ie. `yarn nx run registration:dev` for the Registration application. **Or**, you can use the scripts available in `bciers/package.json`:

| Script          | Link                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| yarn reg1       | [http://localhost:3000](http://localhost:3000)                                                                                               |
| yarn dash       | [http://localhost:3000](http://localhost:3000)                                                                                               |
| yarn reg        | [http://localhost:4000](http://localhost:4000)                                                                                               |
| yarn report     | [http://localhost:5000](http://localhost:5000)                                                                                               |
| yarn compliance | [http://localhost:7000](http://localhost:7000)                                                                                               |
| yarn dev-all    | Runs target dev for all multi-zone projects defined in `bciers/apps/dashboard/next.config.js` [http://localhost:3000](http://localhost:3000) |

### Testing

- To run Vitest unit tests on a specific project: `yarn nx run {project}:test`.
- To run Vitest unit tests on all projects: `yarn nx run-many -t test`.
- To run playwright end-to-end tests: `nx run {project}:e2e` (For the first time, you may need to run `yarn playwright install --with-deps` to install the browsers)

**Or**, you can use the scripts available in `bciers/package.json`

### Building

- To build a specific project: `yarn nx run {project}:build`.

**Or**, you can use the scripts available in `bciers/package.json`

## Pre-Commit

[pre-commit](https://pre-commit.com/) runs a variety of formatting and lint checks configured in [`.pre-commit-config.yaml`](../.pre-commit-config.yaml) which are required for a pull request to pass CI.

`pre-commit install` will [configure a pre-commit hook to run before every commit](https://pre-commit.com/#usage); alternatively, you can run it manually with:

```bash
pre-commit run --all-files
```

If you are impatient and your work is isolated to Javascript, it may be faster to run only the linter and formatter (`eslint` and `prettier`), but it may not catch everything (such as the end-of-file fixer and trailing whitespace):

```bash
yarn lint && yarn format
```

## Commit Message Conventions

We use [gitlint](https://jorisroovers.com/gitlint/) to check commit message formatting. You can enable it by using `pre-commit install --hook-type commit-msg`.

This project follows the commit message conventions outlined by [Conventional Commits](https://www.conventionalcommits.org/). Besides the standard commit types (message prefixes) **feat** and **fix**, we use some other types described there based on the Angular convention; some common ones among those are **test**, **docs**, **chore** and **refactor**. You can find the configuration details in the [.gitlint](../.gitlint) file

We also extend this prefix convention to the naming of **branches**, eg: `docs/#githubissuenumber-add-readme` or `feat/#githubissuenumber-some-feature`.

## Yarn Modern Troubleshooting

Some developers have had issues when setting up a new environment with yarn modern, corepack & asdf. Here are some steps that have worked to get the environment working in that case:

1. remove yarn from your global asdf setup (in ~/.tools-version for example)
2. run asdf reshim
3. go to cas-registration/bciers and run corepack enable
4. yarn --version should return 4.2.0 and not 1.yy.zz
