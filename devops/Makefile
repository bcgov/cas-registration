.PHONY: generate_credentials
generate_credentials:
	./scripts/generate-gcloud-credentials.sh $(service_account)

.PHONY: create_state_buckets
create_state_buckets:
	./scripts/create-state-buckets.sh $(openshift_nameplate) "ggl-cas-storage"
