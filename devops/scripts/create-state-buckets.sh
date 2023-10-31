#!/bin/bash
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <OPENSHIFT_NAMEPLATE> <GOOGLE_PROJECT_ID>"
  exit 1
fi

GOOGLE_PROJECT_ID="$2"
REGION="northamerica-northeast1" # Montreal

OPENSHIFT_NAMEPLATE="$1"
ENVIRONMENTS_TO_APPEND=("dev" "test" "prod")

BUCKET_NAMES=""
for ENV_APPEND in ${ENVIRONMENTS_TO_APPEND[@]}; do
  BUCKET_NAMES+="gs://${OPENSHIFT_NAMEPLATE}-${ENV_APPEND}-state "
done


gcloud storage buckets create $BUCKET_NAMES --project=$GOOGLE_PROJECT_ID --location=$REGION
