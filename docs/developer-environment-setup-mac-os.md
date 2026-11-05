# Setting up and using the Local Development Environment

## Prerequisites

### 1. Install `mise`

[mise](https://mise.jdx.dev/getting-started.html) installs the tool versions pinned in `.tool-versions` (repo root: Node.js, Python, gcloud; `bc_obps`: Python, Poetry, PostgreSQL).

```bash
brew install mise
```

We use mise in [shims mode](https://mise.jdx.dev/dev-tools/shims.html), so terminals, `make`, IDEs and git hooks all resolve the same tools. Add this to `~/.zprofile`:

```bash
eval "$(mise activate zsh --shims)"
```

Then open a new terminal and run `mise doctor`. It should report `shims_on_path: yes` and no problems.

> With shims, mise env vars (like `PGDATA` from `bc_obps/mise.toml`) are applied to the tool commands themselves (`pg_ctl`, `psql`, …), not exported to your shell, so `echo $PGDATA` prints nothing. Use `mise env` to see them.

### 2. Install system dependencies

```bash
brew install pkg-config icu4c libxml2 openssl@3 xz pango
```

- `pango` — required by WeasyPrint (PDF generation), which is a Python dependency of the backend
- `pkg-config`, `icu4c`, `libxml2`, `openssl@3`, `xz` — required to compile Python (see below)

#### Compile Python locally

By default mise installs a precompiled Python, which can't find Homebrew's libraries, so WeasyPrint fails with `cannot load library 'libgobject-2.0-0'`. Tell mise to compile Python locally instead (do this **before** `make install_dev_tools`):

```bash
mise settings set python.compile true
```

Because `icu4c`, `libxml2`, and `openssl@3` are keg-only (not linked into `/opt/homebrew` by default), add the following to `~/.zprofile` so the build tools can find them:

```bash
export PKG_CONFIG_PATH="/opt/homebrew/opt/icu4c@78/lib/pkgconfig:/opt/homebrew/opt/libxml2/lib/pkgconfig:/opt/homebrew/opt/openssl@3/lib/pkgconfig:$PKG_CONFIG_PATH"
export LDFLAGS="-L/opt/homebrew/opt/icu4c@78/lib -L/opt/homebrew/opt/libxml2/lib -L/opt/homebrew/opt/openssl@3/lib"
export CPPFLAGS="-I/opt/homebrew/opt/icu4c@78/include -I/opt/homebrew/opt/libxml2/include -I/opt/homebrew/opt/openssl@3/include"
```

> Note: If a newer version of `icu4c` is installed (e.g. `icu4c@80`), update the paths above accordingly. Run `brew list | grep icu4c` to check.

Then reload: `source ~/.zprofile`.

## Repository and Version Control

- Ensure you have push access (most likely by being added to the **@bcgov/cas-developers** GitHub team) to [bcgov/cas-registration](https://github.com/bcgov/cas-registration).
- Ensure you have [GPG commit signing](https://docs.github.com/en/github/authenticating-to-github/signing-commits) set up on your local environment. See [gpg-ssh-setup-guide.md](./gpg-ssh-setup-guide.md) for step-by-step instructions.
  - Ensure your `git config user.email` matches the email used when generating the GPG key.
  - Verify signing works by running `git log --show-signature` after a commit. Once pushed, a "Verified" badge appears next to your commits on GitHub.

- Clone a local copy of [bcgov/cas-registration](https://github.com/bcgov/cas-registration).

## App Environment Variables

In `bc_obps` directory, create a `bc_obps/.env` file from the `bc_obps/.env.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bc_obps/.env` values in document `OBPS backend ENV`.

In `bciers` directory, create a `bciers/.env` file from the `bciers/.env.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bciers/.env` values in document `OBPS FE env`.

In `bciers` directory, create a `bciers/.env.local` file from the `bciers/.env.local.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bciers/.env.local` values in document `OBPS FE env.local`.

In `bciers/apps/registration/e2e` directory, create a `bciers/apps/registration/e2e/.env.local` file from the `bciers/apps/registration/e2e/.env.local.example` file. See `bciers/apps/registration/e2e/.env.local` file for directions to the 1password values.

In `bciers/apps/registration/e2e` directory, create a `bciers/apps//e2e/.env.local` file from the `bciers/apps/registration/e2e/.env.local.example` file. See `bciers/apps/registration/e2e/.env.local` file for directions to the 1password values.

## Backend Environment Setup

Ensure you have completed the [App Environment Variables](#app-environment-variables) section before continuing.

1. From the terminal, cd into directory `cas-registration/bc_obps`.
2. Run `mise trust` (one time) so mise loads `bc_obps/mise.toml`, which sets `PGDATA` to `bc_obps/.pgdata` (gitignored).
3. Run `make install_dev_tools`. This installs Python, Poetry and PostgreSQL via mise, creates the local postgres cluster in `bc_obps/.pgdata` if it doesn't exist yet, and starts the postgres server.
4. Run `make install_poetry_deps` to install all python dependencies. To activate the virtual environment, run `eval $(poetry env activate)`. To exit run `deactivate`.
5. Create a PostgreSQL role for your local user matching `DB_USER` in your `.env`:
   ```bash
   psql -h localhost -U postgres -c "CREATE USER <your_db_user> WITH SUPERUSER;"
   ```
   Ensure `DB_USER` in your `.env` is **lowercase** — PostgreSQL role names are case-sensitive in connection strings.
6. Run `make start_pg` to start the postgres server if it is not already running, then `make create_db` to create the database.
7. Run `make migrate` to run all database migrations.
8. Run `make run`, which will start running the development server locally (default port is :8000; terminal output will indicate what localhost address to use to access the backend server).
   - to test it out, navigate to the `/api/docs` endpoint in your browser, you should see the API documentation.

9. Optional: to test the Django server's connection to your database, run `python3 manage.py check --database default`.
10. Optional: to load mock data via fixtures, run `make loadfixtures`.

## Backend Environment Use

After doing the initial setup, to get the backend re-running:

1. To set up the database:
   - If you want to drop and recreate the database with mock data, run `make reset_db`. (Warning: This will delete superusers and you will have to recreate with `make superuser`.)
   - If you want to keep your existing database and update (e.g. after a rebase)
     - If there are new migrations, run `make migrate`. (Or, because we're pre-production, you can delete the existing migrations, run `make migrations` and then `make migrate`)
     - If there are new fixtures, run `python manage.py loaddata <path-to-fixture>`
2. Run `make run`

### Troubleshooting

- If you get `role "your_user" does not exist` when running `make create_db` or `make migrate`, the postgres role for your local user hasn't been created yet. With mise-managed postgres (unlike a system install), only the `postgres` superuser exists by default. Connect as `postgres` to create your role:

  ```bash
  psql -h localhost -U postgres -c "CREATE USER <your_db_user> WITH SUPERUSER;"
  ```

  This must be run from the `bc_obps` directory so mise resolves the correct `psql` binary.

- if `make pythontest_parallel` fails with `psycopg.errors.OutOfMemory: out of shared memory`, the default `max_locks_per_transaction` (64) is too low for the number of tables and indexes the test suite creates in parallel. Increase it in `bc_obps/.pgdata/postgresql.conf` (`$PGDATA/postgresql.conf`):

  ```ini
  max_locks_per_transaction = 256
  ```

  Then restart postgres: `make stop_pg && make start_pg`.

- if running poetry commands throws errors about the `_hashlib` library, [try these troubleshooting commands](https://github.com/python-poetry/poetry/issues/7695#issuecomment-1572825140)

- if you encounter an issue installing `psycopg2` relating to `Error: pg_config --libdir failed: No version is set for command pg_config`, run the install from the `bc_obps` directory so mise picks up the postgres version from `bc_obps/.tool-versions`, or set it globally (e.g., `mise use --global postgres@16`)

- if postgres commands fail with `no database directory specified and environment variable PGDATA unset`, run `mise trust` in `bc_obps` and make sure you're running the command from inside `bc_obps` (`mise env | grep PGDATA` should print the path)

- if PDF generation fails with `OSError: cannot load library 'libgobject-2.0-0'`, your Python is the precompiled build. Run `mise settings set python.compile true`, then `mise install python --force`, then recreate the virtualenv (`rm -rf .venv && make install_poetry_deps`)

- if your admin panel looks ugly, run `python3 manage.py collectstatic` to collect static files and then try again.

## Monorepo frontend environment setup

**See the [Nx Monorepo readme](./nx-monorepo.md) for more information.**

### First time setup

First, install the Node.js version specified in `.tool-versions` (from the repo root):

```bash
mise install
```

Then in the `bciers` directory:

1. To enable [Corepack](https://nodejs.org/docs/latest-v20.x/api/corepack.html), in order to use Yarn Modern: `corepack enable && mise reshim` (the reshim creates the `yarn` shim).
2. Verify yarn resolves correctly: `yarn --version` (should show 4.x, not 1.x).
3. To install all Monorepo dependencies: `yarn install`.
4. **Optional**: Run `npm add --global nx@18.2.1` to install `nx` globally. This global instance will use the project version if it differs.

### See the [Nx Monorepo](./nx-monorepo.md) readme for more information

### Development server

1. To run a development server, you can use `yarn nx run {project}:dev`, with `{project}` being the frontend project you are working on. ie. `yarn nx run registration:dev` for the Registration application. **Or**, you can use the scripts available in `bciers/package.json`:

| Script          | Link                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
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

## Git Hooks (prek)

[prek](https://prek.j178.dev/) runs a variety of formatting and lint checks configured in [`prek.toml`](../prek.toml) which are required for a pull request to pass CI.

prek is pinned in the root `.tool-versions`, so `mise install` from the repo root installs it. Then register the git hooks:

```bash
mise install                          # installs prek (and the other root tools)
prek install                          # registers the git hook
prek install --hook-type commit-msg   # also enables commit message linting
```

Alternatively, run all hooks manually without installing:

```bash
prek run --all-files
```

If you are impatient and your work is isolated to Javascript, it may be faster to run only the linter and formatter (`eslint` and `prettier`), but it may not catch everything (such as the end-of-file fixer and trailing whitespace):

```bash
yarn lint && yarn format
```

## Commit Message Conventions

We use [gitlint](https://jorisroovers.com/gitlint/) to check commit message formatting. It is managed automatically by prek — no separate install required. Enable it with `prek install --hook-type commit-msg`.

This project follows the commit message conventions outlined by [Conventional Commits](https://www.conventionalcommits.org/). Besides the standard commit types (message prefixes) **feat** and **fix**, we use some other types described there based on the Angular convention; some common ones among those are **test**, **docs**, **chore** and **refactor**. You can find the configuration details in the [.gitlint](../.gitlint) file

We also extend this prefix convention to the naming of **branches**, eg: `docs/#githubissuenumber-add-readme` or `feat/#githubissuenumber-some-feature`.

## Yarn Modern Troubleshooting

Some developers have had issues when setting up a new environment with yarn modern, corepack. Here are some steps that have worked to get the environment working in that case:

1. remove yarn from your global mise config (`mise unuse --global yarn`, or delete it from `~/.config/mise/config.toml`)
2. go to cas-registration/bciers and run `corepack enable`
3. run `mise reshim` so the `yarn` shim points at corepack's yarn
4. yarn --version should return 4.x and not 1.yy.zz
