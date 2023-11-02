SHELL := /usr/bin/env bash
__FILENAME := $(lastword $(MAKEFILE_LIST))
__DIRNAME := $(abspath $(realpath $(lastword $(MAKEFILE_LIST)))/../)

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
		echo "REG_NAMESPACE_PREFIX is not set"; \
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
install: ## Installs the helm chart on the OpenShift cluster
install: check_environment
install:
install: GIT_SHA1=$(shell git rev-parse HEAD)
install: IMAGE_TAG=$(GIT_SHA1)
install: NAMESPACE=$(OBPS_NAMESPACE_PREFIX)-$(ENVIRONMENT)
install: CHART_DIR=./helm/cas-registration
install: CHART_INSTANCE=cas-registration
install: HELM_OPTS=--atomic --wait-for-jobs --timeout 2400s --namespace $(NAMESPACE) \
										--set defaultImageTag=$(IMAGE_TAG) \
										--values $(CHART_DIR)/values-$(ENVIRONMENT).yaml
install:
	@set -euo pipefail; \
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

include .env.devops
.PHONY: bootstrap_terraform
bootstrap_terraform:
	./devops/scripts/generate-gcloud-credentials.sh $(SERVICE_ACCOUNT)
	./oc create secret generic gcp-credentials-secret --from-file=sa_json=./credentials.json --from-literal=gcp_project_id="ggl-cas-storage" --from-literal=openshift_namespace=$(OPENSHIFT_NAMESPACE) --from-literal=openshift_nameplate=$(OPENSHIFT_NAMEPLATE) --from-literal=openshift_environment=$(OPENSHIFT_ENVIRONMENT)
	./devops/scripts/create-state-bucket.sh $(OPENSHIFT_NAMESPACE) "ggl-cas-storage"
	./devops/scripts/create-terraform-backend.sh $(OPENSHIFT_NAMEPLATE) $(OPENSHIFT_ENVIRONMENT)
	@mv $(OPENSHIFT_ENVIRONMENT).gcs.tfbackend ./devops
	@mv credentials.json ./devops
	./devops/scripts/create-kubernetes-secret-admin-sa.sh $(OPENSHIFT_NAMESPACE)
