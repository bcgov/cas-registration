# DevOps setup for Terraform

An OpenShift job is integrated into a the 'cas-registration' Helm chart. It deploys at the pre-install, pre-upgrade hooks. The Terraform scripts are located in the `/terraform` subdirectory in the chart, which is then pulled in via a ConfigMap utilized by the job at `/templates/backend/job/terraform-apply.yaml`.

[CAS-Pipeline](https://github.com/bcgov/cas-pipeline) was used to create the storage buckets that terraform uses to store state, and provision secrets used as credentials.
