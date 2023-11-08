#!/bin/bash

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <OPENSHIFT_NAMEPLATE> <ENVIRONMENT>"
  exit 1
fi

REGION="northamerica-northeast1" # Montreal
OPENSHIFT_NAMEPLATE="$1"
ENVIRONMENT="$2"

BUCKET_NAME="${OPENSHIFT_NAMEPLATE}-${ENVIRONMENT}-state"

SERVICE_ACCOUNT_KEY_FILE="credentials.json"

cat <<EOL > $ENVIRONMENT.gcs.tfbackend
bucket = "$BUCKET_NAME"
prefix = "terraform/state"
credentials = "/etc/gcp/$SERVICE_ACCOUNT_KEY_FILE"
EOL

# Easy color variables for echo
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "==> Initialize Terraform with ${GREEN}terraform init -backend-config=${ENVIRONMENT}.gcs.tfbackend${NC}"
