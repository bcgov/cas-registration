# CIIP - SWRS Import to OBPS

This directory contains all the files necessary to import data from ciip/swrs into the obps database in openshift. This is intended to be a one-time import, but can be run again if necessary. Some of this code could be useful for future imports or as part of the data warehouse.

## Contents

- **obps_operator_import_fdw.sql**: An sql file to create a foreign data wrapper to the CIIP database.
- **obps_import_operators_from_fdw.sql**: An sql file to import the data from the fdw into the OBPS database.
- **Dockerfile**: A dockerfile with using the postgres-14.6 image to enable us to psql into the OBPS database & create/run the above files.
- **import-job-template.yaml**: An example job template that can be manually created in openshift to run the import job.

## Steps:

- Retrieve the secrets necessary to replace the example values in the ENV section of the import-job-template.yaml. These secrets can be retrieved from the OBPS namespace & the CIIP namespace in openshift.
- Create the job manually in the OBPS namespace (either from the openshift UI or command line with `oc create -f import-job-template.yaml` )
- If the job is successful it will create the two fdw functions & run the data import from CIIP
- Confirm that the data has been successfully added to the OBPS database.
