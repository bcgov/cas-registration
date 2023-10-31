# DevOps setup for Terraform

These directions are used to establish the initial state buckets through deploying an OpenShift job and will help create the requisite configs. At the conclusion of these directions, you will have the following:

- A secret (`gcp-credentials-secret`) in your OpenShift repository that contains a json Google Service Account provisioned for Terraform (`terraform@project.iam.gserviceaccount.com`) as `sa_json` and its associated Google Project ID as `gcp_project_id`
- A job using the above to get you terraform credentials.
- A set of three Google Cloud Storage buckets deployed to your Google Project. (`nameplate-dev-state`, `nameplate-prod-state`, `nameplate-test-state`)

0. Ensure you are in the root directory.
1. Use `./devops/scripts/generate-gcloud-credentials.sh {Google Service Account Email}`, where `{Google Service Account Email}` is the service account email (ie. `terraform@project.iam.gserviceaccount.com`) Credentials will be stored as `/credentials.json`.
2. Create the requisite secrets in your OpenShift project with `oc create secret generic gcp-credentials-secret --from-file=sa_json=./credentials.json --from-literal=gcp_project_id={Google Project ID} --from-literal=ocp_nameplate={Openshift Nameplate}`, where `{Google Project ID}` is the Project where the storage buckets will be created (matching the credentials used) and `{Openshift Nameplate}` is the nameplate of the Openshift project (ie. for namespace `1a2b3c-test`, the nameplate is `1a2b3c`).
   a. You will need to be logged into OpenShift, using your token provided by the web interface.
3. Provision the job to Openshift to generate the state buckets with `oc create -f ./devops/openshift/deploy/job/provision-tf-state-buckets.yaml`.
