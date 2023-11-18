#!/bin/bash
# Creates a role and service account bound to that role to provide to Terraform to administer secrets in an OpenShift namespace

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <OPENSHIFT_NAMESPACE_WITH_ENV>"
  exit 1
fi

OPENSHIFT_NAMESPACE_WITH_ENV="$1"
ROLE_NAME=terraform-secret-admin
SERVICE_ACCOUNT_NAME=terraform-kubernetes-service-account
SERVICE_ACCOUNT_ADDRESS="${OPENSHIFT_NAMESPACE_WITH_ENV}:${SERVICE_ACCOUNT_NAME}"
BINDING_NAME="${SERVICE_ACCOUNT_NAME}-secret-admin-binding"

oc create role $ROLE_NAME --verb=create,delete,deletecollection,get,list,patch,update,watch --resource=secrets -n=$OPENSHIFT_NAMESPACE_WITH_ENV
oc create sa $SERVICE_ACCOUNT_NAME
oc create rolebinding $BINDING_NAME --role=$ROLE_NAME --serviceaccount=$SERVICE_ACCOUNT_ADDRESS
export TF_SA_TOKEN_NAME=$(oc describe serviceaccount $SERVICE_ACCOUNT_NAME | grep -Po "(?<=^Tokens:)\s+.*" | awk '{$1=$1};1')
echo "A Service Account has been created for Terraform as a Secret Admin has been created in Openshift as:\n$TF_SA_TOKEN_NAME"
# ALTERNATE_SA_TOKEN_NAME=$(oc get secrets | grep -Po "$SERVICE_ACCOUNT_NAME-token-\w+")
