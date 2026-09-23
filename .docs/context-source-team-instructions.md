This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: bc_obps/Makefile, bc_obps/Dockerfile
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
bc_obps/
  Dockerfile
  Makefile
```

# Files

## File: bc_obps/Dockerfile
```dockerfile
# syntax=docker/dockerfile:1
# check=skip=InvalidDefaultArgInFrom

# PYTHON_VERSION is deliberately left without a default: a build that doesn't pass it should fail
# rather than silently build on the wrong Python, hence the skipped check above.
# In CI, the Python version is specified in the build args, see .github/workflows/build-backend.yaml
ARG PYTHON_VERSION

####################
# Base Stage
####################
FROM dhi.io/python:${PYTHON_VERSION}-debian13-dev AS base

# Prevent Python from writing .pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1 \
    # Ensure Python output is sent straight to terminal (no buffering)
    PYTHONUNBUFFERED=1 \
    # Define a user ID for the non-root user
    USER_ID=1001 \
    # Set the home and working directory to /app
    HOME=/app \
    # Prevent apt-get from prompting during installs
    DEBIAN_FRONTEND=noninteractive \
    # Set asdf version
    ASDF_VERSION=0.15.0

WORKDIR ${HOME}

# Grant the numbered user complete access to the workspace root directory
RUN chown -R ${USER_ID}:0 ${HOME} && \
    chmod -R g+rwX ${HOME}

####################
# Builder Stage
####################
FROM base AS builder

# Refresh package lists from repositories
RUN apt-get update && \
# Install minimal tools and dependencies
    apt-get install -y --no-install-recommends build-essential curl && \
# Remove apt cache to reduce image size
    apt-get clean && \
# Delete package lists to further slim the image
    rm -rf /var/lib/apt/lists/*

# Add bin path for poetry
ENV PATH="/app/.local/bin:${PATH}"

# Copy version config and Poetry files with ownership set to numbered user
COPY --chown=${USER_ID}:0 .tool-versions pyproject.toml poetry.lock ${HOME}/

USER ${USER_ID}

# Use bash with environment sourcing for asdf commands
SHELL ["/bin/bash", "-c"]

# Configure Poetry and install dependencies
# Extract Poetry version from .tool-versions
RUN POETRY_VERSION=$(grep '^poetry ' ${HOME}/.tool-versions | awk '{print $2}') && \
    # Use inbuilt Python to install Poetry
    curl -sSL https://install.python-poetry.org | python3 - && \
    # Add Poetry to PATH in bashrc
    # Keep virtualenv in project directory (.venv)
    ${HOME}/.local/bin/poetry config virtualenvs.create true && \
    ${HOME}/.local/bin/poetry config virtualenvs.in-project true && \
    # Install dependencies without dev group, non-interactively
    ${HOME}/.local/bin/poetry install --without dev --no-root --no-interaction --no-ansi --compile

# Copy all remaining files, owned by numbered user
COPY --chown=${USER_ID}:0 . ${HOME}/

####################
# Runner Stage
####################
FROM base AS runner

# Refresh package lists from repositories
RUN apt-get update && \
    # Install essential runner packages and WeasyPrint dependencies
    apt-get install -y --no-install-recommends \
    curl \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-xlib-2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-liberation && \
    # Clean apt cache
    apt-get clean && \
    # Remove package lists to reduce size
    rm -rf /var/lib/apt/lists/*

# Copy application from the builder stage
COPY --from=builder --chown=${USER_ID}:0 ${HOME}/ ${HOME}/

# Remove asdf and Poetry files
RUN rm .tool-versions pyproject.toml poetry.lock

USER ${USER_ID}

# Make port 8000 available for external connections
EXPOSE 8000

# Check every 30s with a 3s timeout
HEALTHCHECK --interval=30s --timeout=3s \
    # Fail if curl request fails
    CMD curl -f http://localhost:8000/ || exit 1

# Collect static files using the virtual environment's Python
RUN ${HOME}/.venv/bin/python manage.py collectstatic --noinput

# Run migrations and start gunicorn directly from the virtual environment
CMD ["/bin/bash", "-c", "${HOME}/.venv/bin/python manage.py custom_migrate && ${HOME}/.venv/bin/gunicorn --access-logfile - bc_obps.wsgi:application --timeout 200 --workers 3 --bind '0.0.0.0:8000'"]
```

## File: bc_obps/Makefile
```makefile
SHELL := /usr/bin/env bash
PSQL=psql -h localhost
DB_NAME=registration
MANAGE_PY = manage.py
SCHEMA_NAME=erc
PYTEST=pytest --rootdir=bc_obps --import-mode=importlib

# If the VIRTUAL_ENV is specified, we can assume we're in a poetry virtual env, otherwise
# we need to execute "poetry run"
ifdef VIRTUAL_ENV
POETRY_RUN=
else
POETRY_RUN=poetry run
endif

help: ## Show this help.
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

.PHONY: install_backend_asdf_tools
install_backend_asdf_tools: ## install languages runtimes and tools specified in .tool-versions of the backend
install_backend_asdf_tools:
	@echo "Installing backend asdf tools"
	@cat .tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin add || true
	@asdf plugin update --all
	@#MAKELEVEL=0 is required because of https://www.postgresql.org/message-id/1118.1538056039%40sss.pgh.pa.us
	@MAKELEVEL=0 POSTGRES_EXTRA_CONFIGURE_OPTIONS='--with-libxml' asdf install
	@asdf reshim
	@echo "Done installing backend asdf tools"

.PHONY: install_poetry
install_poetry: ## install poetry (MacOS/Linux only)
install_poetry:
	@echo "Installing poetry"
	@curl -sSL https://install.python-poetry.org | python3 -

.PHONY: install_dev_tools
install_dev_tools: ## install development tools
install_dev_tools: stop_pg install_backend_asdf_tools install_poetry start_pg

.PHONY: install_poetry_deps
install_poetry_deps: ## install poetry dependencies
install_poetry_deps:
	@echo "Configuring poetry virtualenvs"
	@poetry config virtualenvs.create true
	@poetry config virtualenvs.in-project true
	@echo "Installing poetry dependencies"
	@poetry install
	@echo "Done installing poetry dependencies"

.PHONY: start_pg
start_pg: ## start the database server if it is not running
start_pg:
	@pg_ctl status || pg_ctl start

.PHONY: stop_pg
stop_pg: ## stop the database server. Always exits with 0
stop_pg:
	@pg_ctl stop; true

.PHONY: create_db
create_db: ## Ensure that the $(DB_NAME) database exists
create_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 1 || \
		$(PSQL) -d postgres -c "CREATE DATABASE $(DB_NAME)";

.PHONY: drop_db
drop_db: ## Drop the $(DB_NAME) database if it exists
drop_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 0 || \
		$(PSQL) -d postgres -c "DROP DATABASE $(DB_NAME)";

.PHONY: run
run: ## run the server
run:
	$(POETRY_RUN) python $(MANAGE_PY) runserver

.PHONY: migrate
migrate: ## run the migrations
migrate:
	$(POETRY_RUN) python $(MANAGE_PY) custom_migrate

.PHONY: migrations
migrations: ## create the migrations
migrations:
	$(POETRY_RUN) python $(MANAGE_PY) makemigrations

.PHONY: migrations_empty
migrations_empty: ## create a new empty migration file under specified APP_NAME
migrations_empty:
	$(POETRY_RUN) python $(MANAGE_PY) makemigrations --empty $(APP_NAME)

.PHONY: superuser
superuser: ## create a superuser
superuser:
	$(POETRY_RUN) python $(MANAGE_PY) create_superuser

loadfixtures: ## add fixtures to the database
loadfixtures:
	$(POETRY_RUN) python $(MANAGE_PY) load_fixtures $(ARGS)
	$(POETRY_RUN) python $(MANAGE_PY) load_reporting_fixtures $(ARGS)
	$(POETRY_RUN) python $(MANAGE_PY) load_compliance_fixtures $(ARGS)

.PHONY: reset_db
reset_db: ## drop and recreate the db
reset_db:  drop_db create_db migrate

.PHONY: clean
clean: ## delete python bytecode
clean:
	find . -name \*.pyc -delete

.PHONY: pythontests
pythontests: ## run Python tests
pythontests: # ARGS can be used to pass arguments to pytest like -k to specify a test name
	$(POETRY_RUN) $(PYTEST) $(ARGS)


.PHONY: pythontests_verbose
pythontests_verbose: ## run Python tests with verbose output
pythontests_verbose:
	$(POETRY_RUN) $(PYTEST) -v

.PHONY: pythontests_coverage
pythontests_coverage: ## run Python tests with coverage
pythontests_coverage:
	$(POETRY_RUN) $(PYTEST) --cov=. --cov-config=.coveragerc --cov-report=term-missing --no-cov-on-fail


.PHONY: update_email_snapshots
update_email_snapshots: ## update email template snapshot baselines after intentional changes
update_email_snapshots:
	$(POETRY_RUN) $(PYTEST) common/tests/email_snapshots/ --snapshot-update

.PHONY: pythontests_parallel
pythontests_parallel: ## run Python tests in parallel for faster execution
pythontests_parallel:
	$(POETRY_RUN) $(PYTEST) -n auto $(ARGS)

.PHONY: clear_db
clear_db: ## Clear all data in the datbase
clear_db:
	$(POETRY_RUN) python $(MANAGE_PY) truncate_dev_data_tables

.PHONY: shell
shell: ## run the Django shell plus
shell:
	$(POETRY_RUN) python $(MANAGE_PY) shell_plus


.PHONY: mypy
mypy: ## run mypy static type checker with explicit package bases(useful in the absence of __init__.py files)
mypy: ## We can use --show-traceback to show the full traceback in case of an error
	$(POETRY_RUN) mypy . --explicit-package-bases $(ARGS)

.PHONY: prepare_backend
prepare_backend: ## Install dependencies, reset the database, and run the server
prepare_backend: install_poetry_deps reset_db run
```
