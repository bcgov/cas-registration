SHELL := /usr/bin/env bash
PSQL=psql -h localhost
DB_NAME=registration
MANAGE_PY = manage.py

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
	@poetry run python $(MANAGE_PY) runserver

.PHONY: migrate
migrate: ## run the migrations
migrate:
	@poetry run python $(MANAGE_PY) migrate

.PHONY: migrations
migrations: ## create the migrations
migrations:
	@poetry run python $(MANAGE_PY) makemigrations

.PHONY: superuser
superuser: ## create a superuser
superuser:
	@poetry run python $(MANAGE_PY) createsuperuser
