# Migration test charts

This directory contains helm charts for testing the schema migrations run on the database. It does this by deploying a new database from a backup, then running the migrations against it.

## Usage

The migration test charts are intended to be used with the `bc_obps_test_migrations` dag in deployed to our CAS Airflow instance. See the [release process](../release.md) for more details.

## Structure

### Airflow DAG

The `bc_obps_test_migrations` dag is defined in `dags/bc_obps_test_migrations.py`. It runs the following steps:

1. Deploy the `cas-obps-postgres-migration-test` chart to the target namespace.
1. Wait for the database to be ready (accepting connections).
1. Test the database has been restored from the backup (not empty).
1. Deploy the `cas-obps-backend-migration-test` chart to the target namespace.
1. Wait for the backend to be ready (accepting connections).
1. Test that the backend is running the latest migrations.
1. Uninstall both charts from the target namespace.

If any of the steps fail, the dag will fail. As the charts are uninstalled in the final step, the pod logs can be inspected to determine the cause of the failure.

#### Prerequisites to use an empty namespace (destination-ns) to test the migrations from (source-dev/test/prod()

**Roles/RoleBindings**

- [ ] Create RoleBinding in destination-ns, from SA "cas-airflow-worker" (ns: airflow-dev/test/prod) to Role "cas-provision-deployer"
- [ ] Create ServiceAccount named "airflow-deployer" in destination-ns
- [ ] Create RoleBinding in destination-ns, from SA "airflow-deployer" to role cas-provision-deployer
- [ ] Add "name: "airflow-deployer", namespace: destination-ns" in the list of subjects of the "airflow-cas-provision-deployer-binding" RoleBinding in the source namespace

**GCS access**

- [ ] Copy the secret "gcp-<source-ns>-obps-backups-service-account-key" into <destination-ns>, the chart will look for it

### Helm charts: `/helm/migration-test`

#### `cas-obps-postgres-migration-test`

This chart deploys a new database using the CrunchyDB PG Operator, using the latest backup from the source namespace. It contains a cronjob that waits for the database to be ready, and then another cronjob that checks to see if the database has been restored from the backup (checking for the existence of migrations).

#### `cas-obps-backend-migration-test`

This chart deploys a new instance of the BCIERS backend. It contains a cronjob that waits for the backend to be ready, and another cronjob to wait for any new migrations to be applied. If the migrations are not applied, the job will fail.
