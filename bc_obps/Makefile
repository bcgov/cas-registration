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

.PHONY: start_pg_test_optimized
start_pg_test_optimized: ## start/restart postgres with test-optimized durability settings
start_pg_test_optimized:
	@pg_ctl status && pg_ctl restart -m fast -o "-c fsync=off -c full_page_writes=off -c synchronous_commit=off" || pg_ctl start -o "-c fsync=off -c full_page_writes=off -c synchronous_commit=off"

.PHONY: stop_pg
stop_pg: ## stop the database server. Always exits with 0
stop_pg:
	@pg_ctl stop; true

.PHONY: make_tables_unlogged
make_tables_unlogged: ## Make all tables UNLOGGED for faster tests (WARNING: CI/test only! Data lost on crash)
make_tables_unlogged:
	@echo "Making all tables UNLOGGED for test performance (may need multiple passes due to FK dependencies)..."
	@for i in 1 2 3; do \
		echo "DO \$$\$$ DECLARE r RECORD; BEGIN FOR r IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('public', 'erc', 'erc_history', 'common', 'mocks') LOOP BEGIN EXECUTE 'ALTER TABLE ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename) || ' SET UNLOGGED'; EXCEPTION WHEN OTHERS THEN NULL; END; END LOOP; END \$$\$$;" | $(PSQL) -d $(DB_NAME) -q 2>/dev/null || true; \
	done
	@echo "✓ All tables are now UNLOGGED"

.PHONY: make_tables_logged
make_tables_logged: ## Revert all tables to LOGGED (normal durability)
make_tables_logged:
	@echo "Reverting all tables to LOGGED..."
	@echo "DO \$$\$$ DECLARE r RECORD; BEGIN FOR r IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('public', 'erc', 'erc_history', 'common', 'mocks') LOOP BEGIN EXECUTE 'ALTER TABLE ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename) || ' SET LOGGED'; EXCEPTION WHEN OTHERS THEN NULL; END; END LOOP; END \$$\$$;" | $(PSQL) -d $(DB_NAME)
	@echo "✓ All tables are now LOGGED"

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

# ==================== Test Performance Benchmarks ====================
# Compare the impact of different Postgres optimizations on test performance
# Usage: make benchmark_all (runs all 3 benchmarks on FULL test suite)
# Override with: make benchmark_all BENCHMARK_TESTS="path/to/tests/ -q"
BENCHMARK_TESTS ?= -q --tb=line

.PHONY: benchmark_no_optimization
benchmark_no_optimization: ## Benchmark 1: No optimizations (baseline)
benchmark_no_optimization: stop_pg
	@echo ""
	@echo "========================================="
	@echo "BENCHMARK 1: No Optimizations (Baseline)"
	@echo "========================================="
	@echo "Postgres: Regular settings (fsync=on, full_page_writes=on)"
	@echo "Tables: LOGGED"
	@echo "========================================="
	@$(MAKE) start_pg > /dev/null
	@$(MAKE) create_db > /dev/null 2>&1 || true
	@$(MAKE) make_tables_logged > /dev/null 2>&1 || true
	@echo "Running tests..."
	@time $(POETRY_RUN) $(PYTEST) -n auto $(BENCHMARK_TESTS)

.PHONY: benchmark_pg_optimized
benchmark_pg_optimized: ## Benchmark 2: Postgres durability optimizations
benchmark_pg_optimized: stop_pg
	@echo ""
	@echo "========================================="
	@echo "BENCHMARK 2: Postgres Optimizations"
	@echo "========================================="
	@echo "Postgres: fsync=off, full_page_writes=off, synchronous_commit=off"
	@echo "Tables: LOGGED"
	@echo "========================================="
	@$(MAKE) start_pg_test_optimized > /dev/null
	@$(MAKE) create_db > /dev/null 2>&1 || true
	@$(MAKE) make_tables_logged > /dev/null 2>&1 || true
	@echo "Running tests..."
	@time $(POETRY_RUN) $(PYTEST) -n auto $(BENCHMARK_TESTS)

.PHONY: benchmark_unlogged
benchmark_unlogged: ## Benchmark 3: Postgres optimizations + UNLOGGED tables
benchmark_unlogged: stop_pg
	@echo ""
	@echo "========================================="
	@echo "BENCHMARK 3: PG Optimizations + UNLOGGED"
	@echo "========================================="
	@echo "Postgres: fsync=off, full_page_writes=off, synchronous_commit=off"
	@echo "Tables: UNLOGGED"
	@echo "========================================="
	@$(MAKE) start_pg_test_optimized > /dev/null
	@$(MAKE) create_db > /dev/null 2>&1 || true
	@$(MAKE) make_tables_unlogged > /dev/null 2>&1 || true
	@echo "Running tests..."
	@time $(POETRY_RUN) $(PYTEST) -n auto $(BENCHMARK_TESTS)
	@$(MAKE) make_tables_logged > /dev/null 2>&1 || true

.PHONY: benchmark_all
benchmark_all: ## Run all 3 benchmarks and show comparison table
benchmark_all:
	@echo ""
	@echo "======================================================================"
	@echo "  BACKEND TEST PERFORMANCE BENCHMARKS"
	@echo "======================================================================"
	@echo ""
	@echo "Running 3 benchmarks (expected time: ~20-30 minutes)..."
	@echo ""
	@$(MAKE) benchmark_no_optimization 2>&1 | tee /tmp/bench1.txt
	@echo ""
	@echo ""
	@$(MAKE) benchmark_pg_optimized 2>&1 | tee /tmp/bench2.txt
	@echo ""
	@echo ""
	@$(MAKE) benchmark_unlogged 2>&1 | tee /tmp/bench3.txt
	@echo ""
	@echo "======================================================================"
	@echo "  BENCHMARK RESULTS SUMMARY"
	@echo "======================================================================"
	@echo ""
	@printf "%-40s | %-15s\n" "Configuration" "Time"
	@echo "----------------------------------------------------------------------"
	@printf "%-40s | " "1. Baseline (no optimizations)"; grep "^real" /tmp/bench1.txt | tail -1 | awk '{print $$2}'
	@printf "%-40s | " "2. Postgres Optimized"; grep "^real" /tmp/bench2.txt | tail -1 | awk '{print $$2}'
	@printf "%-40s | " "3. PG Optimized + UNLOGGED tables"; grep "^real" /tmp/bench3.txt | tail -1 | awk '{print $$2}'
	@echo ""
	@echo "======================================================================"
	@rm -f /tmp/bench1.txt /tmp/bench2.txt /tmp/bench3.txt

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

.PHONY: load_test_data
load_test_data: ## Load test data into the database
load_test_data:
	$(POETRY_RUN) python $(MANAGE_PY) load_test_data

.PHONY: load_reporting_test_data
load_reporting_test_data: ## Load reporting test data into the database
load_reporting_test_data:
	$(POETRY_RUN) python $(MANAGE_PY) load_reporting_test_data

.PHONY: prepare_backend
prepare_backend: ## Install dependencies, reset the database, and run the server
prepare_backend: install_poetry_deps reset_db run
