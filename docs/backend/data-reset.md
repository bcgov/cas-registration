# Resetting a deployed backend to base status

An Airflow DAG is available to reset the database the backend uses to a clean state. The same data reset is also run on `helm upgrade` runs when `dev` and `test` are updated. _This command is explicitly disabled in the production environment._

## Resetting the database

To reset the database:

1. Navigate to the Airflow UI for the environment you want to reset.
2. Click the `Trigger` button in the `bc_obps_reset_data` DAG.
   > This will trigger the DAG to run, which will reset the database to a clean state and cycle the backend pods. The pods will be restarted and run migrations to bring them back to the latest default state.
