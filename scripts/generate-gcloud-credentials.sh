#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <SERVICE_ACCOUNT>"
  exit 1
fi

SERVICE_ACCOUNT="$1"

gcloud iam service-accounts keys create credentials.json --iam-account=$SERVICE_ACCOUNT
