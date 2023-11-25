# DevOps setup for Terraform

These directions are used to establish the initial state buckets through deploying an OpenShift job and will help create the requisite configs. At the conclusion of these directions, you will have the following:

- A secret (`gcp-credentials-secret`) in your OpenShift repository that contains a json Google Service Account provisioned for Terraform (`terraform@project.iam.gserviceaccount.com`) as `sa_json` and its associated Google Project ID as `gcp_project_id`
- A job using the above to get you terraform credentials.
- A set of three Google Cloud Storage buckets deployed to your Google Project. (namespace-state, ie. `nameplate-prod-state`, `nameplate-test-state`)

## Setup

### One-liner

0. Ensure you are in the root directory.
1. Make a copy of `/devops/.env.devops.example` to `/.env.devops`. Fill in the fields.
2. Uncomment the `make bootstrap_terraform` make target in root Makefile
3. Run `make bootstrap_terraform`.

### Manual with scripts

The one-liner above preforms what the scripts below do.

0. Ensure you are in the root directory.
1. Use `./devops/scripts/generate-gcloud-credentials.sh {Google Service Account Email}`, where `{Google Service Account Email}` is the service account email (ie. `terraform@project.iam.gserviceaccount.com`) Credentials will be stored as `/credentials.json`.
2. Run `make create-kubernetes-secret-admin-sa OPENSHIFT_NAMESPACE={openshift_namespace}` to provision a service account in Openshift for Terraform to use.
3. Create the requisite secrets in your OpenShift project with `oc create secret generic gcp-credentials-secret --from-file=sa_json=./credentials.json --from-literal=gcp_project_id={Google Project ID} --from-literal=openshift_namespace={Openshift Namespace} --from-literal=openshift_nameplate={Openshift Nameplate} --from-literal=openshift_environment={Openshift environment} --from-literal=terraform-secrets-sa-name=`, where `{Google Project ID}` is the Project where the storage buckets will be created (matching the credentials used) and `{Openshift **}` is the namespace, nameplate, and environment of the Openshift project.
   a. You will need to be logged into OpenShift, using your token provided by the web interface.
4. Provision the job to Openshift to generate the state bucket for a particular namespace with `oc create -f ./devops/openshift/deploy/job/provision-tf-state-bucket.yaml`.
   a. Use `oc project {openshift namespace}` to change projects.
5. Move `credentials.json` from the root directory to `/devops`.
6. Move the `{environment}.gcs.tfbackend$` from the root directory to `/devops`, and run `terraform init -backend-config={environment}.gcs.tfbackend`.

## Usage

With these credentials and buckets initialized, Terraform's state is stored remotely in GCS. Taking advantage of this is a Helm OpenShift Job executed in as part of a `pre-install`/`pre-upgrade` hook. The container run in this from a Dockerfile (`./devops/Dockerfile`) that copies in the `./devops/terraform` directory which contains the Terraform code to run. As the state is stored remotely, the job will only update state that already exists. Modifications to the Terraform code will be reflected when the Helm chart is run (manually or via ShipIt), triggering the job.

### Re-usage

With minor modifications to `.env.devops`, `make bootstrap_terraform` can be used to bootstrap any OpenShift + GCP project for Terraform usage (decoupled from Terraform Cloud). Terraform code can be then written and pulled into a new Docker container, which can then be run by a job manifest like `/helm/cas-registration/templates/backend/job/terraform-apply.yaml` to execute Terraform remotely.
