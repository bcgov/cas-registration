# CIIP - SWRS Import to OBPS

This directory contains all the files necessary to import data from ciip/swrs into the obps database in openshift. This is intended to be a one-time import, but can be run again if necessary. Some of this code could be useful for future imports or as part of the data warehouse.

## Contents

- **obps_swrs_import_fdw.sql**: An sql file to create a foreign data wrapper to the CIIP database.
- **obps_import_swrs+data_from_fdw.sql**: An sql file to import the data from the fdw into the OBPS database.
- **Dockerfile**: A dockerfile with using the postgres-14.6 image to enable us to psql into the OBPS database & create/run the above files.
- **import-job-template.yaml**: An example job template that can be manually created in openshift to run the import job.

## Steps:

- Retrieve the secrets necessary to replace the example values in the ENV section of the import-job-template.yaml. These secrets can be retrieved from the OBPS namespace & the CIIP namespace in openshift.
- Create the job manually in the OBPS namespace (either from the openshift UI or command line with `oc create -f import-job-template.yaml` )
- If the job is successful it will create the two fdw functions & run the data import from CIIP
- Confirm that the data has been successfully added to the OBPS database.

## Manual Testing:

- This import was manually tested in the following ways:
  - The set of results in the obps operator table is equal to the number of results from the initial swrs.organisation query used to pare down the results into unique operator rows where the operator submitted a swrs report in 2022.
  - The set of results in the obps operation table is equal to the number of results from the initial swrs.facilty query used to pare down the results into unique facility rows where the facility_type was either 'SFO' or 'LFO' and the facility submitted a swrs report in 2022.
  - The following union query was run on the output of the fdw import to ensure that the correct operations were associated to the correct operators in the obps operation table:

  ``` sql
  -- BEGIN SOURCE QUERY
  with x as (
  select max(o.report_id) as max_report_id, o.swrs_organisation_id from swrs.organisation o
  join swrs.report r on r.id = o.report_id
  and r.reporting_period_duration=2022
  group by o.swrs_organisation_id
  ),
  y as(
    select o.* from swrs.organisation o
    join x
    on x.swrs_organisation_id = o.swrs_organisation_id
    and x.max_report_id = o.report_id
  ),
  z as (
    select swrs_facility_id, max(report_id) as latest_report from swrs.facility where facility_type in ('SFO', 'LFO')
    group by swrs_facility_id
    order by swrs_facility_id
  ),
  w as(
    select sf.*, r.swrs_organisation_id from z
    join swrs.facility sf
    on sf.swrs_facility_id = z.swrs_facility_id
    and sf.report_id = z.latest_report
    join swrs.report r
    on r.id = sf.report_id
    and r.reporting_period_duration=2022
  )
  select y.swrs_organisation_id, w.swrs_facility_id from w join y on w.swrs_organisation_id = y.swrs_organisation_id
  -- END SOURCE QUERY
  union
  -- BEGIN DESTINATION QUERY
  select swrs_organisation_id, swrs_facility_id from operation f join operator o on f.operator_id = o.id;
  --END DESTINATION QUERY
  ```
  The number of results did not differ after applying the union operator on the two queries. So there are no extraneous rows between the two queries where a facility / operation's swrs_facility_id has been associated incorrecty with a different organisation / operator's swrs_organisation_id.
