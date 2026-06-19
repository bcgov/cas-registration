# Development Environment Setup Guide (Ubuntu)

---

## Prerequisites

### System packages

The following packages are required before running `make install_dev_tools`:

```bash
# Build essentials and core development tools
sudo apt-get install -y build-essential pkg-config

# ICU support (required for PostgreSQL build)
sudo apt-get install -y libicu-dev

# UUID support
sudo apt-get install -y uuid-dev

# Python development libraries
sudo apt-get install -y libbz2-dev libsqlite3-dev tk-dev liblzma-dev

# WeasyPrint dependencies (required by the backend PDF generation)
sudo apt-get install -y libpango-1.0-0 libpangocairo-1.0-0 libcairo2
```

### Install asdf

Install [asdf](https://asdf-vm.com/) (0.16+) and add the following to your `~/.bashrc`:

```bash
export ASDF_DATA_DIR="$HOME/.asdf"
export PATH="${ASDF_DATA_DIR}/shims:${PATH}"
```

Then reload: `source ~/.bashrc`.

---

## Repository and Version Control

- Ensure you have push access (most likely by being added to the **@bcgov/cas-developers** GitHub team) to [bcgov/cas-registration](https://github.com/bcgov/cas-registration).
- Ensure you have [GPG commit signing](https://docs.github.com/en/github/authenticating-to-github/signing-commits) set up on your local environment. See [gpg-ssh-setup-guide.md](./gpg-ssh-setup-guide.md) for step-by-step instructions.
  - Ensure your `git config user.email` matches the email used when generating the GPG key.
  - Verify signing works by running `git log --show-signature` after a commit. Once pushed, a "Verified" badge appears next to your commits on GitHub.

- Clone a local copy of [bcgov/cas-registration](https://github.com/bcgov/cas-registration).

---

## App Environment Variables

In `bc_obps` directory, create a `bc_obps/.env` file from the `bc_obps/.env.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bc_obps/.env` values in document `OBPS backend ENV`.

In `bciers` directory, create a `bciers/.env` file from the `bciers/.env.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bciers/.env` values in document `OBPS FE env`.

In `bciers` directory, create a `bciers/.env.local` file from the `bciers/.env.local.example` file. See the 1Password `Clean Growth Digital Services Team` vault for the `bciers/.env.local` values in document `OBPS FE env.local`.

---

## Backend Installation Steps

1. From the terminal, cd into directory `cas-registration/bc_obps`.

2. Run `make install_dev_tools`. This will install asdf plugins and poetry. To activate the virtual environment after setup, run `eval $(poetry env activate)`. To exit run `deactivate`.

3. Run `make install_poetry_deps` to install all Python dependencies.

4. Run `make start_pg` to start the postgres server.

5. Create a PostgreSQL role for your local user matching `DB_USER` in your `.env` (asdf-managed postgres only has the `postgres` superuser by default):

```bash
psql -h localhost -U postgres -c "CREATE USER your_db_user WITH SUPERUSER PASSWORD 'your_db_password';"
```

Ensure `DB_USER` in your `.env` is **lowercase** — PostgreSQL role names are case-sensitive in connection strings.

6. Run `make create_db` to create the database.

7. Run `make migrate` to run all database migrations.

8. Run `make run` to start the development server (default port :8000). Navigate to `/api/docs` in your browser to verify.

## Common Issues and Solutions

### PostgreSQL Port Conflict

If you see an error about port 5432 being in use, you may need to stop the system PostgreSQL:

```bash
sudo systemctl stop postgresql
```

Then restart the asdf-managed PostgreSQL:

```bash
make start_pg
```

### PostgreSQL User Errors

If you see "role your_username does not exist" when running database commands, make sure you've completed step 5 of the Backend Installation Steps to create your PostgreSQL user.

## Managing the Development Environment

### Virtual Environment

This project uses Poetry managed by asdf.
You can activate the virtual environment in two ways:

1. Using Poetry (recommended):

```bash
eval $(poetry env activate)
```

> **Note**: Poetry 2.0+ removed the `shell` command. `poetry env activate` now prints the activation script rather than spawning a shell — use `eval $(poetry env activate)` to activate it. Alternatively, prefix individual commands with `poetry run`:
>
> ```bash
> poetry run python manage.py [command]
> ```

2. Direct activation (alternative):

```bash
source $(poetry env info --path)/bin/activate
```

### PostgreSQL Management

- Start PostgreSQL:

```bash
make start_pg
```

- Stop PostgreSQL:

```bash
make stop_pg
```

## Verifying Installation

You can verify your installation by checking the versions of installed components:

```bash
# Check Python version
python --version

# Check Poetry version
poetry --version

# Check PostgreSQL version
psql --version
```

## Post-Restart Steps

After system restart, you'll need to:

### Backend

1. Start PostgreSQL: Either run `make start_pg` from inside the
   cas-registration/bc_obps directory or
   `make -C bc_obps start_pg` from the root (cas-registration/) directory
2. Activate the virtual environment:

   ```bash
   # Using Poetry (via asdf)
   eval $(poetry env activate)

   # Or alternatively, activate directly:
   source $(poetry env info --path)/bin/activate
   ```

3. From inside the `cas-registration/bc_obps` directory, run `make run`.
   This will start running the backend development server locally (default port is :8000;
   terminal output will indicate what localhost address to use to access the backend server).
   To test it out, navigate to the /api/docs endpoint in your browser

### Frontend

1. After completing the Frontend Development Setup (if not done yet, see below), open a new terminal window and navigate to the bciers directory:

   ```bash
   cd bciers
   ```

2. Start all frontend applications:

   ```bash
   yarn dev-all
   ```

3. Open your browser in incognito mode and navigate to:

   ```
   http://localhost:3000/onboarding
   ```

4. Click the "Log in with Business BCeID" button

5. On the login page, enter your username and password, then click the Continue button

6. On the next page, select "Compliance" or another available option to proceed with the application

---

# Frontend Development Setup

This guide will help you set up the frontend development environment for the CAS Registration project.

## Prerequisites

### Required Tools

1. **Node.js**
   - Version: 24.16.0 (as specified in `.tool-versions`)
   - Required for running the JavaScript/TypeScript codebase

2. **Package Manager**
   - Yarn (Modern version using `.yarnrc.yml`)
   - Used for managing project dependencies

3. **Version Manager**
   - asdf (recommended)
   - Helps manage tool versions consistently across the team

### System Requirements

- Linux/Unix-based system or WSL for Windows users
- Git (for version control)
- Docker and Docker Compose (for containerized development)

## Installation Guide

### Using asdf (Recommended Method)

1. **Install asdf** (if not already installed — see [Prerequisites](#prerequisites) above for setup)

2. **Install Node.js plugin and version**

   ```bash
   asdf plugin add nodejs
   asdf install nodejs 24.16.0
   asdf reshim nodejs
   ```

### Alternative Method (Without asdf)

1. **Install Node.js 24.16.0**
   - Using nvm:
     ```bash
     nvm install 24.16.0
     nvm use 24.16.0
     ```
   - Or download directly from [Node.js website](https://nodejs.org/)

2. **Install Yarn**
   ```bash
   corepack enable
   ```

## Project Setup

1. **Clone the repository** (if not already done)

   ```bash
   git clone https://github.com/bcgov/cas-registration.git
   cd cas-registration/bciers
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your local configuration values (see 1Password vault `OBPS FE env.local`)

## Project Structure

The frontend is organized as a monorepo using Nx, containing multiple applications and shared libraries.

### Applications

| Application      | Path                          | Description              |
| ---------------- | ----------------------------- | ------------------------ |
| `dashboard`      | `/bciers/apps/dashboard`      | Dashboard application    |
| `registration`   | `/bciers/apps/registration`   | Registration application |
| `reporting`      | `/bciers/apps/reporting`      | Reporting application    |
| `administration` | `/bciers/apps/administration` | Administration interface |
| `coam`           | `/bciers/apps/coam`           | COAM application         |

### Shared Libraries

Located in `/bciers/libs/shared/`:

| Library      | Path                | Purpose                                |
| ------------ | ------------------- | -------------------------------------- |
| `actions`    | `shared/actions`    | Shared actions and state management    |
| `components` | `shared/components` | Reusable UI components                 |
| `img`        | `shared/img`        | Shared images and assets               |
| `proxies`    | `shared/proxies`    | Common proxy functions                 |
| `styles`     | `shared/styles`     | Shared styling and themes              |
| `testConfig` | `shared/testConfig` | Testing configurations and utilities   |
| `types`      | `shared/types`      | Shared TypeScript types and interfaces |

### Running Specific Applications

To run any of these applications, use the project name in the nx commands:

```bash
# Examples
yarn nx run dashboard:dev        # Run dashboard in development mode
yarn nx run registration:dev     # Run registration in development mode
yarn nx run reporting:dev        # Run reporting in development mode
yarn nx run administration:dev   # Run administration in development mode
yarn nx run coam:dev            # Run COAM in development mode
```

### Working with Shared Libraries

The shared libraries are automatically available to all applications in the monorepo. When making changes to shared libraries, all dependent applications will be automatically rebuilt.

## Running the Application

### Development Mode

1. **Start the administration app**

   ```bash
   yarn admin
   ```

   This will start the app on port 4001

2. **Start the COAM app**
   ```bash
   yarn coam
   ```
   This will start the app on port 7000

### Testing

1. **Run unit tests**

   ```bash
   yarn admin:test      # For administration app tests
   yarn coam:test       # For COAM app tests
   yarn components:test # For shared components tests
   yarn utils:test      # For utilities tests
   ```

2. **Run E2E tests**

   ```bash
   yarn admin:e2e      # For administration app E2E tests
   yarn coam:e2e       # For COAM app E2E tests
   ```

3. **Run E2E tests with UI**
   ```bash
   yarn admin:e2e:ui   # For administration app E2E tests with UI
   yarn coam:e2e:ui    # For COAM app E2E tests with UI
   ```

### Building for Production

1. **Build the administration app**

   ```bash
   yarn admin:build
   ```

2. **Build the COAM app**
   ```bash
   yarn coam:build
   ```

## Running the Project Locally

### Prerequisites

- Node.js 24.16.0 (managed by asdf)
- Yarn (via Node's Corepack)
- Nx CLI (installed via project dependencies)

### Running Commands

The project uses Nx as a build system. You can run commands in two ways:

1. Using project dependencies (recommended):
   ```bash
   yarn nx run {project}:{target}
   ```
2. Using direct nx commands (if installed globally):
   ```bash
   nx {target} {project}
   ```

### Common Commands

| Command Purpose         | Command to Run                 |
| ----------------------- | ------------------------------ |
| Development server      | `yarn nx run {project}:dev`    |
| Build project           | `yarn nx run {project}:build`  |
| Start production server | `yarn nx run {project}:start`  |
| Run tests               | `yarn nx run {project}:test`   |
| Run E2E tests           | `yarn nx run {project}:e2e`    |
| Run E2E tests with UI   | `yarn nx run {project}:e2e:ui` |
| Format code check       | `yarn nx format:check`         |
| Format code write       | `yarn nx format:write`         |

### Examples for Specific Projects

For the administration app:

```bash
yarn nx run administration:dev    # Start development server
yarn nx run administration:build  # Build the app
yarn nx run administration:test   # Run tests
```

For the COAM app:

```bash
yarn nx run coam:dev    # Start development server
yarn nx run coam:build  # Build the app
yarn nx run coam:test   # Run tests
```

### Additional Features

- Run multiple projects in parallel:

  ```bash
  yarn nx run-many --target=test
  ```

- Format specific projects:
  ```bash
  yarn nx format:check --projects project1,project2
  yarn nx format:write --projects project1,project2
  ```

## Troubleshooting

### Common Issues

1. **Node.js version mismatch**
   - Verify your Node.js version:
     ```bash
     node --version
     ```
   - Should output: v24.16.0

2. **Yarn issues**
   - Clear yarn cache:
     ```bash
     yarn cache clean
     ```
   - Remove node_modules and reinstall:
     ```bash
     rm -rf node_modules
     yarn install
     ```

3. **Port conflicts**
   - Check if ports 4001 or 7000 are already in use:
     ```bash
     lsof -i :4001
     lsof -i :7000
     ```

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/v24.16.0/api/)
- [Yarn Documentation](https://yarnpkg.com/getting-started)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nx Documentation](https://nx.dev/getting-started/intro)

---

## Git Hooks (prek)

[prek](https://prek.j178.dev/) runs formatting and lint checks required for PRs to pass CI.

From the repo root, install prek and register the git hooks:

```bash
pip install -r requirements.txt
prek install                          # registers the pre-commit hook
prek install --hook-type commit-msg   # also enables commit message linting
```

Alternatively, run all hooks manually without installing:

```bash
prek run --all-files
```

## Commit Message Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Common types: **feat**, **fix**, **test**, **docs**, **chore**, **refactor**. See [.gitlint](../.gitlint) for configuration details.

Branch names follow the same convention, e.g. `docs/#123-add-readme` or `feat/#456-some-feature`.

---

_Last updated: June 19, 2026_
