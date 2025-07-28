# Manual Backups of the Database

To take a manual backup of the database in Openshift:

1. Log in to Openshift
2. Open up the Terminal for the leader postgres prod
3. Run the following command:

`pgbackrest --type=full --stanza=db backup`

Refer to: https://access.crunchydata.com/documentation/postgres-operator/latest/tutorials/backups-disaster-recovery/backup-management#taking-a-one-off-backup
