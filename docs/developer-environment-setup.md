# Setting up the Local Development Environment

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

In both the `client` and `bc_obps` directories, create a `.env` file and copy the contents of `.env.example` file of the respective directory into it. See the 1Password vault for the values.

## Backend Environment Setup

1. From the `cas-registration/bc_obps` directory, run `make install_dev_tools`. This will install asdf plugins, poetry and activate the poetry virtual environment (to get into the environment again after setup, run `poetry shell`).
2. Run `make install_poetry_deps` to install all python dependencies.
3. Run `make start_pg` to start the postgres server if it is not already running.
4. Run `make create_db` to create the database.
5. Run `make migrate` to run all database migrations.
6. Run `make run`, which will start running the development server locally (default port is :8000; terminal output will indicate what localhost address to use to access the backend server).
   - to test it out, navigate to the `/api/docs` endpoint in your browser, you should see documentation for the /add endpoint
   - navigate to the `api/add?a=4&b=2` endpoint in your browser, which should return as a result the sum of the specified values for a and b.
7. Optional: to test the Django server's connection to your database, run `python3 manage.py check --database default`

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

## Frontend Environment Setup

In the `client` directory:

1. To install depedencies: `yarn`
2. To run the development server: `yarn dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Pre-Commit

TODO: Add pre-commit instructions

## Commit Message Conventions

TODO: Add commit message conventions
