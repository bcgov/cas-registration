.PHONY: generate_credentials
generate_credentials:
	./scripts/generate-gcloud-credentials.sh $(service_account)

# TODO!: Add an example.env file to pull in all these variables for ease of scripting.
.PHONY: create_state_bucket
create_state_bucket:
	./scripts/create-state-bucket.sh $(openshift_namespace) "ggl-cas-storage"

.PHONY: create_all_state_buckets
create_all_state_buckets:
	./scripts/create-all-state-buckets.sh $(openshift_nameplate) "ggl-cas-storage"

.PHONY: create_terraform_backend
create_terraform_backend:
	./scripts/create-terraform-backend.sh $(openshift_nameplate) $(environment)

.PHONY: create_all_terraform_backends
create_all_terraform_backends:
	./scripts/create-terraform-backend.sh $(openshift_nameplate) "dev"
	./scripts/create-terraform-backend.sh $(openshift_nameplate) "test"
	./scripts/create-terraform-backend.sh $(openshift_nameplate) "prod"
