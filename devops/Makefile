.PHONY: generate_credentials
generate_credentials:
	./scripts/generate-gcloud-credentials.sh $(service_account)

.PHONY: create_state_buckets
create_state_buckets:
	./scripts/create-state-buckets.sh $(openshift_nameplate) "ggl-cas-storage"

.PHONY: create_terraform_backend
create_terraform_backend:
	./scripts/create-terraform-backend.sh $(openshift_nameplate) $(environment)

.PHONY: create_all_terraform_backends
create_all_terraform_backends:
	./scripts/create-terraform-backend.sh $(openshift_nameplate) "dev"
	./scripts/create-terraform-backend.sh $(openshift_nameplate) "test"
	./scripts/create-terraform-backend.sh $(openshift_nameplate) "prod"
