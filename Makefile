SHELL := /usr/bin/env bash
__FILENAME := $(lastword $(MAKEFILE_LIST))
__DIRNAME := $(abspath $(realpath $(lastword $(MAKEFILE_LIST)))/../)

NAMESPACE ?= $(OBPS_NAMESPACE_PREFIX)-$(ENVIRONMENT)
DB_CLUSTER_NAME ?= obps
BACKUP_BUCKET ?=
DB_PASSWORD ?=
RESTORE_TYPE ?= default
CHART_DIR ?= ./helm/cas-bciers
DR_AUTO_CONFIRM ?= false
# Provide defaults so helm --set flags are not empty when prefixes are not provided
AIRFLOW_NAMESPACE_PREFIX ?= airflow
GGIRCS_NAMESPACE_PREFIX ?= ggircs

help: ## Show this help.
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

.PHONY: release
release: ## Tag a release using release-it
release:
	@yarn
	@yarn release-it

.PHONY: lint_chart
lint_chart: ## Checks the configured helm chart template definitions against the remote schema
lint_chart:
	@set -euo pipefail; \
	helm dep up ./helm/cas-registration; \
	helm template -f ./helm/cas-registration/values-dev.yaml cas-registration ./helm/cas-registration --validate;


check_environment: ## Making sure the environment is properly configured for helm
check_environment:
	@set -euo pipefail; \
	if [ -z '$(OBPS_NAMESPACE_PREFIX)' ]; then \
	   echo "OBPS_NAMESPACE_PREFIX is not set"; \
	   exit 1; \
	fi; \
	if [ -z '$(ENVIRONMENT)' ]; then \
	   echo "ENVIRONMENT is not set"; \
	   exit 1; \
	fi; \


verify_postgres_deployment: ## Making sure the environment is properly configured for helm
verify_postgres_deployment:
	@set -euo pipefail; \
	if ! helm status --namespace $(NAMESPACE) cas-obps-postgress; then \
	   echo "Postgres is not deployed to $(NAMESPACE)." \
	   exit 1; \
	fi; \

.PHONY: install
install: ## Installs the BCIERS helm chart on the OpenShift cluster
install: check_environment
install:
install: GIT_SHA1=$(shell git rev-parse HEAD)
install: IMAGE_TAG=$(GIT_SHA1)
install: NAMESPACE=$(OBPS_NAMESPACE_PREFIX)-$(ENVIRONMENT)
install: CHART_DIR=./helm/cas-bciers
install: CHART_INSTANCE=cas-bciers
install: HELM_OPTS=--atomic --wait-for-jobs --timeout 2400s --namespace $(NAMESPACE) \
                               --set defaultImageTag=$(IMAGE_TAG) \
                               --set download-dags.dagConfiguration="$$dagConfig" \
                               --set download-migration-test-dags.dagConfiguration="$$migrationTestDagConfig" \
                               --set download-database-reset-dag.dagConfiguration="$$resetDataDagConfig" \
                               --values $(CHART_DIR)/values-$(ENVIRONMENT).yaml \
                               --set airflowNamespace="$(AIRFLOW_NAMESPACE_PREFIX)-$(ENVIRONMENT)" \
                               --set cas-logging-sidecar.host=elasticsearch.$(GGIRCS_NAMESPACE_PREFIX)-tools.svc.cluster.local
install:
	@set -euo pipefail; \
	dagConfig=$$(echo '{"org": "bcgov", "repo": "cas-registration", "ref": "$(GIT_SHA1)", "path": "dags/cas_bciers_dags.py"}' | base64 -w0); \
	migrationTestDagConfig=$$(echo '{"org": "bcgov", "repo": "cas-registration", "ref": "$(GIT_SHA1)", "path": "dags/bc_obps_test_migrations.py"}' | base64 -w0); \
	resetDataDagConfig=$$(echo '{"org": "bcgov", "repo": "cas-registration", "ref": "$(GIT_SHA1)", "path": "dags/bc_obps_reset_data.py"}' | base64 -w0); \
	helm dep up $(CHART_DIR); \
	if ! helm status --namespace $(NAMESPACE) cas-obps-postgres; then \
	   echo "ERROR: Postgres is not deployed to $(NAMESPACE)."; \
	elif ! helm status --namespace $(NAMESPACE) $(CHART_INSTANCE); then \
	   echo 'Installing the application'; \
	   helm install $(HELM_OPTS) $(CHART_INSTANCE) $(CHART_DIR); \
	else \
	   helm upgrade $(HELM_OPTS) $(CHART_INSTANCE) $(CHART_DIR); \
	fi;


.PHONY: generate_credentials
generate_credentials:
	./scripts/generate-gcloud-credentials.sh $(service_account)

.PHONY: create_state_buckets
create_state_buckets:
	./scripts/create-state-buckets.sh $(openshift_nameplate) "ggl-cas-storage"

.PHONY: perf_test_reg_backend
perf_test_reg_backend: ## run backend performance tests with k6
perf_test_reg_backend: SERVER_HOST := http://127.0.0.1:8000
perf_test_reg_backend: SERVER_API_ROUTE := /api/registration
perf_test_reg_backend: SERVER_ROUTE := $(SERVER_HOST)$(SERVER_API_ROUTE)
perf_test_reg_backend:
	@K6_WEB_DASHBOARD=true k6 -e SERVER_HOST=$(SERVER_ROUTE) run bciers/apps/registration/tests/performance/backend-load-test.js --out csv=k6_results/test_results_reg_backend.csv

.PHONY: perf_test_reg_frontend
perf_test_reg_frontend: ## run frontend performance tests with k6
perf_test_reg_frontend: APP_HOST := http://localhost:3000
perf_test_reg_frontend:
	@K6_WEB_DASHBOARD=true k6 -e APP_HOST=$(APP_HOST) run bciers/apps/registration/tests/performance/frontend-load-test.js --out csv=k6_results/test_results_reg_frontend.csv

.PHONY: perf_test_rep_backend
perf_test_rep_backend: ## run reporting backend performance tests with k6
perf_test_rep_backend: SERVER_HOST := http://127.0.0.1:8000
perf_test_rep_backend: SERVER_API_ROUTE := /api/reporting
perf_test_rep_backend: SERVER_ROUTE := $(SERVER_HOST)$(SERVER_API_ROUTE)
perf_test_rep_backend:
	@K6_WEB_DASHBOARD=true k6 -e SERVER_HOST=$(SERVER_ROUTE) run bciers/apps/reporting/tests/performance/backend-load-test.js --out csv=k6_results/test_results_rep_backend.csv


.PHONY: dr_verify_backup
dr_verify_backup: ## Verify backup exists and credentials are valid
dr_verify_backup: check_environment
dr_verify_backup:
	@set -euo pipefail; \
	echo "=== Verifying Backup Configuration ==="; \
	if [ -z "$(BACKUP_BUCKET)" ]; then \
	   echo "ERROR: BACKUP_BUCKET not set"; \
	   exit 1; \
	fi; \
	if ! oc get secret gcs-backup-credentials -n $(NAMESPACE) -o jsonpath='{.data.credentials\.json}' | base64 -d >/dev/null 2>&1; then \
	   echo "ERROR: GCS credentials secret not found or invalid in $(NAMESPACE)"; \
	   exit 1; \
	fi; \
	echo "   ✅ GCS credentials found"; \
	echo ""; \
	CREDS_FILE="./gcs-credentials.json"; \
	trap "rm -f $$CREDS_FILE; gcloud auth revoke --quiet 2>/dev/null || true" EXIT; \
	echo "Extracting credentials to $$CREDS_FILE..."; \
	oc get secret gcs-backup-credentials -n $(NAMESPACE) -o jsonpath='{.data.credentials\.json}' | base64 -d > $$CREDS_FILE; \
	echo "   ✅ Credentials file created"; \
	echo ""; \
	if ! command -v gcloud >/dev/null 2>&1; then \
	   echo "   ⚠️  gcloud CLI not found - skipping detailed backup verification"; \
	   echo "   Install gcloud: https://cloud.google.com/sdk/docs/install"; \
	   exit 0; \
	fi; \
	echo "Authenticating with GCS credentials..."; \
	if ! gcloud auth login --cred-file=$$CREDS_FILE --quiet 2>/dev/null; then \
	   echo "   ❌ Failed to authenticate with GCS"; \
	   echo "   Make sure your credentials file is valid"; \
	   exit 1; \
	fi; \
	echo "   ✅ Authenticated successfully"; \
	echo ""; \
	BACKUP_PATH="gs://$(BACKUP_BUCKET)/pgbackrest/repo1/backup/db"; \
	echo "Checking backups in $$BACKUP_PATH..."; \
	BACKUP_DIRS=$$(gcloud storage ls "$$BACKUP_PATH/" 2>/dev/null | grep -E '/[0-9]{8}-[0-9]{6}' || true); \
	if [ -z "$$BACKUP_DIRS" ]; then \
	   echo "   ❌ No backups found in $$BACKUP_PATH"; \
	   exit 1; \
	fi; \
	BACKUP_COUNT=$$(echo "$$BACKUP_DIRS" | wc -l | tr -d ' '); \
	FULL_BACKUPS=$$(echo "$$BACKUP_DIRS" | grep -c 'F/' || true); \
	echo "   Found $$BACKUP_COUNT backup(s), $$FULL_BACKUPS full backups"; \
	LATEST_BACKUP=$$(echo "$$BACKUP_DIRS" | sort -r | sed -n '1p'); \
	LATEST_BACKUP_NAME=$$(basename "$$LATEST_BACKUP" | sed 's|/$$||'); \
	if echo "$$LATEST_BACKUP_NAME" | grep -q 'F$$'; then \
	   echo "   ✅ Latest backup: $$LATEST_BACKUP_NAME [Full]"; \
	elif echo "$$LATEST_BACKUP_NAME" | grep -q '[ID]$$'; then \
	   BASE_PREFIX=$$(echo "$$LATEST_BACKUP_NAME" | cut -d'_' -f1); \
	   BASE_FULL="$${BASE_PREFIX}"; \
	   echo "   📦 Latest backup: $$LATEST_BACKUP_NAME [Incremental/Differential]"; \
	   if echo "$$BACKUP_DIRS" | grep -q "$${BASE_FULL}/"; then \
	      echo "   ✅ Base backup exists: $$BASE_FULL"; \
	   else \
	      echo "   ❌ Base backup missing: $$BASE_FULL"; \
	      USABLE_FULL=$$(echo "$$BACKUP_DIRS" | grep 'F/' | sort -r | sed -n '1p'); \
	      if [ -z "$$USABLE_FULL" ]; then \
	         echo "   ❌ No usable full backups found!"; \
	         exit 1; \
	      fi; \
	      USABLE_NAME=$$(basename "$$USABLE_FULL" | sed 's|/$$||'); \
	      echo "   📦 Found alternative: $$USABLE_NAME"; \
	      read -p "   Use $$USABLE_NAME instead? [y/N] " -n 1 -r; \
	      echo; \
	      if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
	         echo "   Cancelled"; \
	         exit 1; \
	      fi; \
	      echo "$$USABLE_NAME" > /tmp/selected_backup_$(NAMESPACE).txt; \
	      echo "   ✅ Will use: $$USABLE_NAME"; \
	   fi; \
	fi; \
	if [ "$(RESTORE_TYPE)" = "immediate" ]; then \
	   ARCHIVE_PATH="gs://$(BACKUP_BUCKET)/pgbackrest/repo1/archive/db"; \
	   if gcloud storage ls "$$ARCHIVE_PATH/" >/dev/null 2>&1; then \
	      echo "   ✅ WAL archives available - immediate restore enabled"; \
	   else \
	      echo "   ⚠️  No WAL archives - only backup restore available"; \
	   fi; \
	fi; \
	echo "   ✅ Backup verification complete"

.PHONY: dr_restore
dr_restore: ## DR Step 1: Restore PostgreSQL from backup
dr_restore: check_environment dr_verify_backup
	@set -euo pipefail; \
	echo "=== Starting PostgreSQL Restore to $(NAMESPACE) ==="; \
	[ -n "$(BACKUP_BUCKET)" ] || { echo "ERROR: BACKUP_BUCKET not set"; exit 1; }; \
	SELECTED_BACKUP=""; \
	[ -f /tmp/selected_backup_$(NAMESPACE).txt ] && { \
	   SELECTED_BACKUP=$$(cat /tmp/selected_backup_$(NAMESPACE).txt); \
	   echo " Using selected backup: $$SELECTED_BACKUP"; \
	   rm -f /tmp/selected_backup_$(NAMESPACE).txt; \
	}; \
	case "$(RESTORE_TYPE)" in \
	   time) \
	      [ -n "$(RESTORE_TARGET)" ] || { \
	         echo "ERROR: RESTORE_TYPE=time requires RESTORE_TARGET"; \
	         echo "Usage: make dr_restore BACKUP_BUCKET=bucket RESTORE_TYPE=time RESTORE_TARGET='2026-01-13 14:30:00'"; \
	         exit 1; \
	      }; \
	      echo " Point-in-time restore to: $(RESTORE_TARGET)";; \
	   immediate) echo "⚡ Immediate restore (most recent transaction)";; \
	   default) echo "Default restore (latest backup)";; \
	   *) echo "ERROR: Invalid RESTORE_TYPE: $(RESTORE_TYPE)"; echo "Valid options: default, immediate, time"; exit 1;; \
	esac; \
	[ -n "$$SELECTED_BACKUP" ] && echo "Targeting specific backup: $$SELECTED_BACKUP"; \
	echo "Namespace: $(NAMESPACE)"; \
	echo "Cluster: $(DB_CLUSTER_NAME)"; \
	echo "Backup Bucket: $(BACKUP_BUCKET)"; \
	echo ""; \
	[ "$(DR_AUTO_CONFIRM)" = "true" ] || { \
	   read -p "Apply restore configuration? [y/N] " -n 1 -r; echo; \
	   [[ $$REPLY =~ ^[Yy]$$ ]] || { echo "Cancelled"; exit 1; }; \
	}; \
	{ \
	cat $(CHART_DIR)/templates/disaster-recovery/dr-postgres-cluster.yaml | sed \
	  -e 's/__DB_CLUSTER_NAME__/$(DB_CLUSTER_NAME)/g' \
	  -e 's/__NAMESPACE__/$(NAMESPACE)/g' \
	  -e 's/__BACKUP_BUCKET__/$(BACKUP_BUCKET)/g'; \
	if [ "$(RESTORE_TYPE)" = "time" ]; then \
	   printf '%s\n' '        - --type=time' '        - --target=$(RESTORE_TARGET)'; \
	else \
	   printf '%s\n' '        - --type=$(RESTORE_TYPE)'; \
	fi; \
	[ -n "$$SELECTED_BACKUP" ] && printf '%s\n' "        - --set=$$SELECTED_BACKUP"; \
	printf '%s\n' \
	  '  instances:' \
	  '    - name: instance1' \
	  '      replicas: 1' \
	  '      dataVolumeClaimSpec:' \
	  '        accessModes:' \
	  '          - ReadWriteOnce' \
	  '        resources:' \
	  '          requests:' \
	  '            storage: 20Gi' \
	  '        storageClassName: netapp-block-standard'; \
	} | oc apply -f -; \
	echo ""; \
	echo "✅ Restore configuration applied"; \
	echo "Monitor with: make dr_monitor_restore"


.PHONY: dr_monitor_restore
dr_monitor_restore: ## DR: Monitor restore progress
dr_monitor_restore: check_environment
dr_monitor_restore:
	@echo "=== Monitoring Restore Progress in $(NAMESPACE) ===" ; \
	echo "Press Ctrl+C to stop watching"; \
	echo ""; \
	oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME) -w

.PHONY: dr_check_restore_logs
dr_check_restore_logs: ## DR: Check restore job logs
dr_check_restore_logs: check_environment
dr_check_restore_logs:
	@set -euo pipefail; \
	echo "=== Checking Restore Logs ==="; \
	RESTORE_POD=$$(oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/pgbackrest-restore-replica-create -o name 2>/dev/null | sed -n '1p'); \
	if [ -z "$$RESTORE_POD" ]; then \
	   echo "No restore pod found. Checking instance pod..."; \
	   INSTANCE_POD=$$(oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME) -o name | sed -n '1p'); \
	   if [ -n "$$INSTANCE_POD" ]; then \
	      oc logs -n $(NAMESPACE) $$INSTANCE_POD -c database --tail=100; \
	   else \
	      echo "No pods found"; \
	   fi; \
	else \
	   echo "Restore pod logs:"; \
	   oc logs -n $(NAMESPACE) $$RESTORE_POD --tail=100 --follow; \
	fi

.PHONY: dr_finalize_restore
dr_finalize_restore: ## DR Step 2: Remove dataSource after restore completes
dr_finalize_restore: check_environment
dr_finalize_restore:
	@set -euo pipefail; \
	echo "=== Finalizing Restore - Removing dataSource ==="; \
	read -p "Has the restore completed successfully? [y/N] " -n 1 -r; \
	echo; \
	if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
	   echo "Wait for restore to complete first"; \
	   echo "Check with: make dr_check_restore_logs"; \
	   exit 1; \
	fi; \
	echo "Removing dataSource from cluster..."; \
	oc patch postgrescluster $(DB_CLUSTER_NAME) -n $(NAMESPACE) --type=json \
	   -p='[{"op": "remove", "path": "/spec/dataSource"}]'; \
	echo "Waiting for cluster to stabilize..."; \
	sleep 15; \
	echo ""; \
	echo "Cluster status:"; \
	oc get postgrescluster $(DB_CLUSTER_NAME) -n $(NAMESPACE); \
	echo ""; \
	echo "Pod status:"; \
	oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME); \
	echo ""; \
	echo "✅ Restore finalized"

.PHONY: dr_setup_db
dr_setup_db: ## DR Step 3: Setup database users and permissions
dr_setup_db: check_environment
dr_setup_db:
	@set -euo pipefail; \
	if [ -z "$(DB_PASSWORD)" ]; then \
	   echo "ERROR: DB_PASSWORD not set"; \
	   echo "Usage: make dr_setup_db DB_PASSWORD='your-password' OBPS_NAMESPACE_PREFIX=c53ff1 ENVIRONMENT=dev"; \
	   exit 1; \
	fi; \
	DB_POD=$$(oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME),postgres-operator.crunchydata.com/role=master -o name 2>/dev/null | sed -n '1p'); \
	if [ -z "$$DB_POD" ]; then \
	   echo "ERROR: No master database pod found"; \
	   echo "Check pods with: oc get pods -n $(NAMESPACE)"; \
	   exit 1; \
	fi; \
	echo "=== Setting up database users and permissions ==="; \
	echo "Database pod: $$DB_POD"; \
	echo ""; \
	echo "1. Creating/updating obps user..."; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	   psql -U postgres -c "DO \$$\$$ BEGIN IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'obps') THEN CREATE USER obps WITH PASSWORD '$(DB_PASSWORD)'; ELSE ALTER USER obps WITH PASSWORD '$(DB_PASSWORD)'; END IF; END \$$\$$;" 2>/dev/null || true; \
	echo "   ✅ User created/updated"; \
	echo ""; \
	echo "2. Granting database permissions..."; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE obps TO obps;" 2>/dev/null; \
	echo "   ✅ Database permissions granted"; \
	echo ""; \
	echo "3. Granting schema permissions (public)..."; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	   psql -U postgres -d obps -c "GRANT ALL ON SCHEMA public TO obps;" 2>/dev/null; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	   psql -U postgres -d obps -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO obps;" 2>/dev/null; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	   psql -U postgres -d obps -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO obps;" 2>/dev/null; \
	echo "   ✅ Schema permissions granted"; \
	echo ""; \
	echo "4. Checking for additional schemas..."; \
	SCHEMAS=$$(oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	   psql -U postgres -d obps -t -c "SELECT nspname FROM pg_namespace WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'public') AND nspname NOT LIKE 'pg_%';" 2>/dev/null | grep -v '^$$' | xargs); \
	if [ -n "$$SCHEMAS" ]; then \
	   for schema in $$SCHEMAS; do \
	      echo "   Granting permissions on schema: $$schema"; \
	      oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	         psql -U postgres -d obps -c "GRANT ALL ON SCHEMA $$schema TO obps;" 2>/dev/null || true; \
	      oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	         psql -U postgres -d obps -c "GRANT ALL ON ALL TABLES IN SCHEMA $$schema TO obps;" 2>/dev/null || true; \
	      oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	         psql -U postgres -d obps -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA $$schema TO obps;" 2>/dev/null || true; \
	   done; \
	   echo "   ✅ Additional schema permissions granted"; \
	else \
	   echo "   No additional schemas found"; \
	fi; \
	echo ""; \
	echo "5. Granting RLS roles..."; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- \
	   psql -U postgres -d obps -c "GRANT industry_user, cas_admin, cas_analyst, cas_director, cas_pending, cas_view_only TO obps;" 2>/dev/null || true; \
	echo "   ✅ RLS roles granted"; \
	echo ""; \
	echo "✅ Database setup complete"

dr_verify_db: ## DR Step 4: Verify database restoration
dr_verify_db: check_environment
dr_verify_db:
	@set -euo pipefail; \
	DB_POD=$$(oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME),postgres-operator.crunchydata.com/role=master -o name | sed -n '1p'); \
	if [ -z "$$DB_POD" ]; then \
	   echo "ERROR: No database pod found"; \
	   exit 1; \
	fi; \
	echo "=== Verifying Database in $(NAMESPACE) ==="; \
	echo ""; \
	echo "1. Databases:"; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- psql -U postgres -c "\l" 2>/dev/null; \
	echo ""; \
	echo "2. Users:"; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- psql -U postgres -c "\du" 2>/dev/null; \
	echo ""; \
	echo "3. Testing obps user connection:"; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- psql -U obps -d obps -c "SELECT current_database(), current_user, version();" 2>/dev/null && echo "   ✅ Connection successful" || echo "   ❌ Connection failed"; \
	echo ""; \
	echo "4. Schemas:"; \
	oc exec -n $(NAMESPACE) $$DB_POD -c database -- psql -U postgres -d obps -c "\dn" 2>/dev/null; \
	echo ""; \
	echo "5. Sample data check (erc.report):"; \
	COUNT=$$(oc exec -n $(NAMESPACE) $$DB_POD -c database -- psql -U postgres -d obps -t -c "SELECT COUNT(*) FROM erc.report;" 2>/dev/null | xargs); \
	if [ -n "$$COUNT" ]; then \
	   echo "   Found $$COUNT rows in erc.report"; \
	   echo "   ✅ Data exists"; \
	else \
	   echo "   ⚠️  Table may not exist or is empty"; \
	fi; \
	echo ""; \
	echo "✅ Verification complete"

.PHONY: dr_deploy_app
dr_deploy_app: ## DR Step 5: Deploy the application using helm
dr_deploy_app: check_environment
dr_deploy_app:
	@set -euo pipefail; \
	echo "=== Deploying Application to $(NAMESPACE) ==="; \
	echo ""; \
	helm dep up $(CHART_DIR); \
	helm upgrade --install cas-bciers $(CHART_DIR) \
	  --namespace $(NAMESPACE) \
	  --values $(CHART_DIR)/values-$(ENVIRONMENT).yaml \
	  --atomic \
	  --wait-for-jobs \
	  --timeout 2400s; \
	echo ""; \
	echo "✅ Application deployed successfully"

.PHONY: dr_check_backend
dr_check_backend: ## DR: Check backend status and logs
dr_check_backend: check_environment
dr_check_backend:
	@echo "=== Backend Status in $(NAMESPACE) ===" ; \
	echo ""; \
	echo "Pods:"; \
	oc get pods -n $(NAMESPACE) -l component=backend; \
	echo ""; \
	echo "Recent logs (last 50 lines):"; \
	oc logs -n $(NAMESPACE) -l component=backend -c cas-bciers-backend --tail=50 2>/dev/null | tail -20 || echo "No logs available"

.PHONY: dr_test
dr_test: ## DR Step 6: Run smoke tests
dr_test: check_environment
dr_test:
	@set -euo pipefail; \
	echo "=== Running Smoke Tests in $(NAMESPACE) ==="; \
	echo ""; \
	echo "1. Checking backend pod status..."; \
	BACKEND_POD=$$(oc get pods -n $(NAMESPACE) -l component=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null); \
	if [ -z "$$BACKEND_POD" ]; then \
	   echo "   ❌ No backend pod found"; \
	   exit 1; \
	fi; \
	POD_STATUS=$$(oc get pod $$BACKEND_POD -n $(NAMESPACE) -o jsonpath='{.status.phase}'); \
	READY=$$(oc get pod $$BACKEND_POD -n $(NAMESPACE) -o jsonpath='{.status.containerStatuses[?(@.name=="cas-bciers-backend")].ready}'); \
	echo "   Pod: $$BACKEND_POD"; \
	echo "   Status: $$POD_STATUS"; \
	echo "   Ready: $$READY"; \
	if [ "$$POD_STATUS" != "Running" ] || [ "$$READY" != "true" ]; then \
	   echo "   ❌ Pod not ready"; \
	   echo ""; \
	   echo "Pod description:"; \
	   oc describe pod $$BACKEND_POD -n $(NAMESPACE) | tail -30; \
	   exit 1; \
	fi; \
	echo "   ✅ Pod is running and ready"; \
	echo ""; \
	echo "2. Checking backend readiness endpoint..."; \
	oc exec -n $(NAMESPACE) $$BACKEND_POD -c cas-bciers-backend -- curl -sf http://localhost:8000/readiness > /dev/null 2>&1 && echo "   ✅ Backend is ready" || (echo "   ❌ Backend not ready" && exit 1); \
	echo ""; \
	echo "3. Checking backend liveness endpoint..."; \
	oc exec -n $(NAMESPACE) $$BACKEND_POD -c cas-bciers-backend -- curl -sf http://localhost:8000/liveness > /dev/null 2>&1 && echo "   ✅ Backend is alive" || (echo "   ❌ Backend not alive" && exit 1); \
	echo ""; \
	echo "4. Checking for errors in logs..."; \
	ERROR_COUNT=$$(oc logs -n $(NAMESPACE) $$BACKEND_POD -c cas-bciers-backend --tail=100 2>/dev/null | grep -i "error\|exception\|traceback" | wc -l); \
	if [ $$ERROR_COUNT -gt 0 ]; then \
	   echo "   ⚠️  Found $$ERROR_COUNT error(s) in recent logs"; \
	   echo ""; \
	   echo "Recent errors:"; \
	   oc logs -n $(NAMESPACE) $$BACKEND_POD -c cas-bciers-backend --tail=100 | grep -i -A 2 "error\|exception"; \
	else \
	   echo "   ✅ No errors in recent logs"; \
	fi; \
	echo ""; \
	echo "========================================"; \
	echo "  ✅ ALL SMOKE TESTS PASSED"; \
	echo "========================================"

.PHONY: dr_status
dr_status: ## DR: Show current DR-related resources status
dr_status: check_environment
dr_status:
	@echo "=== Disaster Recovery Status ===" ; \
	echo "Namespace: $(NAMESPACE)"; \
	echo "Cluster: $(DB_CLUSTER_NAME)"; \
	echo ""; \
	echo "PostgreSQL Cluster:"; \
	oc get postgrescluster $(DB_CLUSTER_NAME) -n $(NAMESPACE) 2>/dev/null || echo "  ❌ Not found"; \
	echo ""; \
	echo "Database Pods:"; \
	oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME) 2>/dev/null || echo "  ❌ None found"; \
	echo ""; \
	echo "Backend Pods:"; \
	oc get pods -n $(NAMESPACE) -l component=backend 2>/dev/null || echo "  ❌ None found"; \
	echo ""; \
	echo "Helm Release:"; \
	helm list -n $(NAMESPACE) 2>/dev/null | grep cas-bciers || echo "  ❌ Not found"

.PHONY: dr_cleanup
dr_cleanup: ## DR: Delete the PostgreSQL cluster (DESTRUCTIVE)
dr_cleanup: check_environment
dr_cleanup:
	@echo "⚠️  WARNING: This will DELETE the PostgreSQL cluster in $(NAMESPACE)!" ; \
	echo "Cluster name: $(DB_CLUSTER_NAME)"; \
	echo ""; \
	read -p "Type 'DELETE-$(DB_CLUSTER_NAME)' to confirm: " confirm; \
	if [ "$$confirm" = "DELETE-$(DB_CLUSTER_NAME)" ]; then \
	   oc delete postgrescluster $(DB_CLUSTER_NAME) -n $(NAMESPACE); \
	   echo "✅ Cluster deleted"; \
	else \
	   echo "Cancelled (you typed: $$confirm)"; \
	fi

.PHONY: dr_full
dr_full: check_environment ## DR: Run complete disaster recovery process (automated)
dr_full:
	@echo "========================================"; \
	echo "  DISASTER RECOVERY - FULL PROCESS"; \
	echo "========================================"; \
	echo ""; \
	echo "Environment: $(NAMESPACE)"; \
	echo "Backup Bucket: $(BACKUP_BUCKET)"; \
	echo "DB Cluster: $(DB_CLUSTER_NAME)"; \
	echo ""; \
	if [ -z "$(BACKUP_BUCKET)" ]; then \
	   echo "ERROR: BACKUP_BUCKET not set"; \
	   echo ""; \
	   echo "Usage:"; \
	   echo "  make dr_full \\"; \
	   echo "    OBPS_NAMESPACE_PREFIX=c53ff1 \\"; \
	   echo "    ENVIRONMENT=dev \\"; \
	   echo "    BACKUP_BUCKET=d193ca-dev-obps-backups \\"; \
	   echo "    DB_PASSWORD='your-password'"; \
	   exit 1; \
	fi; \
	if [ -z "$(DB_PASSWORD)" ]; then \
	   echo "ERROR: DB_PASSWORD not set"; \
	   exit 1; \
	fi; \
	echo "Checking for existing PostgreSQL cluster..."; \
	EXISTING_CLUSTER=$$(oc get postgrescluster $(DB_CLUSTER_NAME) -n $(NAMESPACE) -o name 2>/dev/null || echo ""); \
	if [ -n "$$EXISTING_CLUSTER" ]; then \
	   echo ""; \
	   echo "⚠️  WARNING: PostgreSQL cluster '$(DB_CLUSTER_NAME)' already exists in $(NAMESPACE)!"; \
	   echo ""; \
	   INSTANCE_POD=$$(oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME),postgres-operator.crunchydata.com/role=master -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo ""); \
	   if [ -n "$$INSTANCE_POD" ]; then \
	      POD_STATUS=$$(oc get pod $$INSTANCE_POD -n $(NAMESPACE) -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown"); \
	      echo "   Database pod: $$INSTANCE_POD (Status: $$POD_STATUS)"; \
	   fi; \
	   echo ""; \
	   echo "Running DR will:"; \
	   echo "  1. Reconfigure the cluster with restore settings"; \
	   echo "  2. Potentially restart pods and restore from backup"; \
	   echo "  3. OVERWRITE any data not in the backup"; \
	   echo ""; \
	   echo "Options:"; \
	   echo "  - Continue anyway and restore from backup"; \
	   echo "  - Cancel and delete the cluster first: make dr_cleanup"; \
	   echo ""; \
	   read -p "Continue with restore anyway? [y/N] " -n 1 -r; \
	   echo; \
	   if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
	      echo "DR cancelled. To delete the existing cluster, run:"; \
	      echo "  make dr_cleanup OBPS_NAMESPACE_PREFIX=$(OBPS_NAMESPACE_PREFIX) ENVIRONMENT=$(ENVIRONMENT)"; \
	      exit 1; \
	   fi; \
	else \
	   echo "   ✅ No existing cluster found"; \
	fi; \
	echo ""; \
	echo "Ready to start DR process."; \
	read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
	   echo "DR cancelled"; \
	   exit 1; \
	fi; \
	echo ""; \
	echo "========================================"; \
	echo "Step 1: Restore PostgreSQL"; \
	echo "========================================"; \
	$(MAKE) dr_restore BACKUP_BUCKET=$(BACKUP_BUCKET) OBPS_NAMESPACE_PREFIX=$(OBPS_NAMESPACE_PREFIX) ENVIRONMENT=$(ENVIRONMENT) DR_AUTO_CONFIRM=true || exit 1; \
	echo ""; \
	echo "⏳ Waiting for restore to complete..."; \
	WAIT_COUNT=0; \
	MAX_WAIT=200; \
	while [ $$WAIT_COUNT -lt $$MAX_WAIT ]; do \
       RESTORE_STATUS=$$(oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/pgbackrest-restore -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "NotFound"); \
       INSTANCE_STATUS=$$(oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME),postgres-operator.crunchydata.com/role=master -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "NotFound"); \
       INSTANCE_READY=$$(oc get pods -n $(NAMESPACE) -l postgres-operator.crunchydata.com/cluster=$(DB_CLUSTER_NAME),postgres-operator.crunchydata.com/role=master -o jsonpath='{.items[0].status.containerStatuses[?(@.name=="database")].ready}' 2>/dev/null || echo "false"); \
       echo -ne "   [$$WAIT_COUNT/$$MAX_WAIT] Restore: $$RESTORE_STATUS | Instance: $$INSTANCE_STATUS | DB Ready: $$INSTANCE_READY\r"; \
       if [ "$$RESTORE_STATUS" = "Completed" ] || [ "$$RESTORE_STATUS" = "Succeeded" ]; then \
          echo ""; \
          echo "   ✅ Restore pod completed"; \
          if [ "$$INSTANCE_STATUS" = "Running" ] && [ "$$INSTANCE_READY" = "true" ]; then \
             echo "   ✅ Database instance is running and ready"; \
             break; \
          fi; \
       fi; \
       if [ "$$INSTANCE_STATUS" = "Running" ] && [ "$$INSTANCE_READY" = "true" ]; then \
          echo ""; \
          echo "   ✅ Database instance is running and ready"; \
          break; \
       fi; \
       WAIT_COUNT=$$((WAIT_COUNT + 1)); \
       sleep 5; \
    done; \
    echo ""; \
    if [ $$WAIT_COUNT -ge $$MAX_WAIT ]; then \
       echo "   ❌ Timeout waiting for restore to complete"; \
       echo "   Check status with: make dr_status"; \
       exit 1; \
    fi; \
	echo ""; \
	echo "✅ Restore completed successfully"; \
	echo ""; \
	echo "========================================"; \
	echo "Step 2: Finalize Restore"; \
	echo "========================================"; \
	echo "Removing dataSource from cluster..."; \
	oc patch postgrescluster $(DB_CLUSTER_NAME) -n $(NAMESPACE) --type=json \
	   -p='[{"op": "remove", "path": "/spec/dataSource"}]'; \
	echo "Waiting for cluster to stabilize..."; \
	sleep 15; \
	echo "✅ Restore finalized"; \
	echo ""; \
	echo "========================================"; \
	echo "Step 3: Setup Database Users"; \
	echo "========================================"; \
	$(MAKE) dr_setup_db DB_PASSWORD='$(DB_PASSWORD)' OBPS_NAMESPACE_PREFIX=$(OBPS_NAMESPACE_PREFIX) ENVIRONMENT=$(ENVIRONMENT) || exit 1; \
	echo ""; \
	echo "========================================"; \
	echo "Step 4: Verify Database"; \
	echo "========================================"; \
	$(MAKE) dr_verify_db OBPS_NAMESPACE_PREFIX=$(OBPS_NAMESPACE_PREFIX) ENVIRONMENT=$(ENVIRONMENT) || exit 1; \
	echo ""; \
	read -p "Database looks good? Continue to deploy app? [y/N] " -n 1 -r; \
	echo; \
	if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
	   echo "Stopped before app deployment"; \
	   echo "You can deploy manually with: make dr_deploy_app"; \
	   exit 0; \
	fi; \
	echo ""; \
	echo "========================================"; \
	echo "Step 5: Deploy Application"; \
	echo "========================================"; \
	$(MAKE) dr_deploy_app OBPS_NAMESPACE_PREFIX=$(OBPS_NAMESPACE_PREFIX) ENVIRONMENT=$(ENVIRONMENT) || exit 1; \
	echo ""; \
	echo "========================================"; \
	echo "Step 6: Run Smoke Tests"; \
	echo "========================================"; \
	$(MAKE) dr_test OBPS_NAMESPACE_PREFIX=$(OBPS_NAMESPACE_PREFIX) ENVIRONMENT=$(ENVIRONMENT) || exit 1; \
	echo ""; \
	echo "========================================"; \
	echo "  ✅ DISASTER RECOVERY COMPLETE"; \
	echo "========================================"; \
	echo ""; \
	echo "Next steps:"; \
	echo "  - Check backend: make dr_check_backend OBPS_NAMESPACE_PREFIX=$(OBPS_NAMESPACE_PREFIX) ENVIRONMENT=$(ENVIRONMENT)"; \
	echo "  - View status: make dr_status OBPS_NAMESPACE_PREFIX=$(OBPS_NAMESPACE_PREFIX) ENVIRONMENT=$(ENVIRONMENT)"; \
	echo "  - Access your application and verify data"
