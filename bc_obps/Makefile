SHELL := /usr/bin/env bash
PSQL=psql -h localhost
DB_NAME=registration
MANAGE_PY = manage.py
SCHEMA_NAME=erc

# If the VIRTUAL_ENV is specified, we can assume we're in a poetry shell, otherwise
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
	@cat .tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin-add || true
	@asdf plugin-update --all
	@#MAKELEVEL=0 is required because of https://www.postgresql.org/message-id/1118.1538056039%40sss.pgh.pa.us
	@MAKELEVEL=0 POSTGRES_EXTRA_CONFIGURE_OPTIONS='--with-libxml' asdf install
	@asdf reshim
	@echo "Done installing backend asdf tools"

.PHONY: install_poetry
install_poetry: ## install poetry (MacOS/Linux only)
install_poetry: ## poetry shell starts a new shell with the virtual environment activated
	@echo "Installing poetry"
	@curl -sSL https://install.python-poetry.org | python3 -
	@poetry shell

.PHONY: install_dev_tools
install_dev_tools: ## install development tools
install_dev_tools: stop_pg install_backend_asdf_tools install_poetry start_pg

.PHONY: install_poetry_deps
install_poetry_deps: ## install poetry dependencies
install_poetry_deps:
	@echo "Installing poetry dependencies"
	@poetry install

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
	$(POETRY_RUN) python $(MANAGE_PY) migrate

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

loadfixtures_v1: ## add all registration v1 fixture files to the db
loadfixtures_v1:
	$(POETRY_RUN) python $(MANAGE_PY) load_fixtures_v1 $(ARGS)
	$(POETRY_RUN) python $(MANAGE_PY) load_reporting_fixtures $(ARGS)

loadfixtures: ## add all registration fixture files to the db
loadfixtures:
	$(POETRY_RUN) python $(MANAGE_PY) load_fixtures $(ARGS)
	$(POETRY_RUN) python $(MANAGE_PY) load_reporting_fixtures $(ARGS)

.PHONY: reset_db
reset_db: ## drop and recreate the db
reset_db:  drop_db create_db migrate loadfixtures

.PHONY: clean
clean: ## delete python bytecode
clean:
	find . -name \*.pyc -delete

.PHONY: pythontests
pythontests: ## run Python tests
pythontests: # ARGS can be used to pass arguments to pytest like -k to specify a test name
	$(POETRY_RUN) pytest $(ARGS)


.PHONY: pythontests_verbose
pythontests_verbose: ## run Python tests with verbose output
pythontests_verbose:
	$(POETRY_RUN) pytest -v

.PHONY: pythontests_watch
pythontests_watch: ## Use pytest-testmon and pytest-watch to trigger test runs on file changes
pythontests_watch:
	$(POETRY_RUN) ptw --runner "pytest --picked --testmon"

.PHONY: pythontests_coverage
pythontests_coverage: ## run Python tests with coverage
pythontests_coverage:
	$(POETRY_RUN) pytest --cov=. --cov-config=.coveragerc --cov-report=term-missing --no-cov-on-fail

.PHONY: clear_db
clear_db: ## Clear all data in the datbase
clear_db:
	$(POETRY_RUN) python $(MANAGE_PY) truncate_dev_data_tables

.PHONY: reset_reg_data
reset_reg_data: ## Clear all data in the database and load registration fixtures
reset_reg_data: clear_db loadfixtures

.PHONY: shell
shell: ## run the Django shell plus
shell:
	$(POETRY_RUN) python $(MANAGE_PY) shell_plus


.PHONY: mypy
mypy: ## run mypy static type checker with explicit package bases(useful in the absence of __init__.py files)
mypy: ## We can use --show-traceback to show the full traceback in case of an error
	$(POETRY_RUN) mypy . --explicit-package-bases $(ARGS)

.PHONY: load_test_data
load_test_data: ## Load test data into the database
load_test_data:
	$(POETRY_RUN) python $(MANAGE_PY) load_test_data

.PHONY: prepare_backend
prepare_backend: ## Install dependencies, reset the database, and run the server
prepare_backend: install_poetry_deps reset_db run
