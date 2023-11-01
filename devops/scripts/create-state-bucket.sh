#!/bin/bash
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <OPENSHIFT_NAMESPACE> <GOOGLE_PROJECT_ID>"
  exit 1
fi

GOOGLE_PROJECT_ID="$2"
REGION="northamerica-northeast1" # Montreal

OPENSHIFT_NAMESPACE="$1"
BUCKET_NAME="gs://${OPENSHIFT_NAMESPACE}-state"

EXISTING_BUCKET=$(gcloud storage ls | grep -o $BUCKET_NAME)

if [ -z "$EXISTING_BUCKET" ]; then
  gcloud storage buckets create $BUCKET_NAME --project=$GOOGLE_PROJECT_ID --location=$REGION
else
  echo "Bucket gs://$BUCKET_NAME already exists."
fi
