# Manual Backups of the Database

To take a manual backup of the database in Openshift:

1. Log in to Openshift
2. Open up the Terminal for the leader postgres prod
3. Run the following command:

`pgbackrest --type=full --stanza=db backup`

Alternatively, the Crunchy PostgresOperator can do this for us: https://access.crunchydata.com/documentation/postgres-operator/latest/tutorials/backups-disaster-recovery/backup-management#taking-a-one-off-backup

1. Log in to Openshift
2. Confirm that you have the backup configured correctly in the Postgres cluster's YAML.
3. Run command

`oc annotate -n <namespace> postgrescluster cas-obps-postgres postgres-operator.crunchydata.com/pgbackrest-backup="$(date)"`

3. You should see a new annotation with today's date added to the YAML file in the Postgres Cluster in Openshift
4. Shortly afterwards you should see a new pod spinning up that will take a backup of the data. The backup process itself may take a while.
