# DevOps setup for Terraform

These directions are used to establish the initial state buckets through deploying an OpenShift job and will help create the requisite configs. At the conclusion of these directions, you will have the following:

- A secret (`gcp-credentials-secret`) in your OpenShift repository that contains a json Google Service Account provisioned for Terraform (`terraform@project.iam.gserviceaccount.com`) as `sa_json` and its associated Google Project ID as `gcp_project_id`
- A job using the above to get you terraform credentials.
- A set of three Google Cloud Storage buckets deployed to your Google Project. (namespace-state, ie. `nameplate-prod-state`, `nameplate-test-state`)

## One-liner

0. Ensure you are in the root directory.
1. Make a copy of `/devops/.env.devops.example` to `/.env.devops`. Fill in the fields.
2. Run `make bootstrap_terraform`.
3. `cd devops` then run `terraform init -backend-config={environment}.gcs.tfbackend` to initialize Terraform with the GCS backend.

## Manual with scripts

The one-liner above preforms what the scripts below do.

0. Ensure you are in the root directory.
1. Use `./devops/scripts/generate-gcloud-credentials.sh {Google Service Account Email}`, where `{Google Service Account Email}` is the service account email (ie. `terraform@project.iam.gserviceaccount.com`) Credentials will be stored as `/credentials.json`.
2. Create the requisite secrets in your OpenShift project with `oc create secret generic gcp-credentials-secret --from-file=sa_json=./credentials.json --from-literal=gcp_project_id={Google Project ID} --from-literal=ocp_namespace={Openshift Namespace}`, where `{Google Project ID}` is the Project where the storage buckets will be created (matching the credentials used) and `{Openshift Namespace}` is the namespace of the Openshift project.
   a. You will need to be logged into OpenShift, using your token provided by the web interface.
3. Provision the job to Openshift to generate the state bucket for a particular namespace with `oc create -f ./devops/openshift/deploy/job/provision-tf-state-bucket.yaml`.
   a. Use `oc project {openshift namespace}` to change projects.
4. Move `credentials.json` from the root directory to `/devops`.
5. Move the `{environment}.gcs.tfbackend$` from the root directory to `/devops`, and run `terraform init -backend-config={environment}.gcs.tfbackend`.
