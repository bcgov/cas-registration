# CIIP - SWRS Import to OBPS

This directory contains all the files necessary to import data from ciip/swrs into the obps database in openshift. This is intended to be a one-time import, but can be run again if necessary. Some of this code could be useful for future imports or as part of the data warehouse.

## Contents

- **obps_swrs_import_fdw.sql**: An sql file to create a foreign data wrapper to the CIIP database.
- **obps_import_swrs_data_from_fdw.sql**: An sql file to import the data from the fdw into the OBPS database.
- **Dockerfile**: A dockerfile with using the postgres-14.6 image to enable us to psql into the OBPS database & create/run the above files.
- **import-job-template.yaml**: An example job template that can be manually created in openshift to run the import job.

## Notes

- In the initial query to retrieve the set of operators who reported to swrs in 2022, there is one duplicate operator who reported to swrs in 2022 under two different swrs_organisation_ids. Their data is otherwise the same (including the cra_business_number). This operator's data is normalized during the import to resolve to one operator in the obps database.
- An image containing the fdw functions was built & pushed manually to ghcr.io/bcgov. If any changes are made to the sql functions, a new image will need to be built, pushed & referenced in the job template.

## First Run Steps:

- Retrieve the secrets necessary to replace the example values in the ENV section of the import-job-template.yaml. These secrets can be retrieved from the OBPS namespace & the CIIP namespace in openshift.
- Create a Kubernetes Network Policy in the prod CIIP openshift environment that allows ingress from the OBPS namespace
- Create the job manually in the OBPS namespace (either from the openshift UI or command line with `oc create -f import-job-template.yaml` )
- If the job is successful it will create the two fdw functions & run the data import from CIIP
- Confirm that the data has been successfully added to the OBPS database.
- Delete the Kubernetes Network Policy in CIIP prod, we shouldn't need it outside of this import work

## Subsequent Run Steps:

- This work is intended for a one-time run, however, it can be run subsequent times by changing one parameter in the job template.
- If any changes to the functions are made, then a new image will need to be built & pushed to ghcrio/bcgov
- The addresses should not be re-imported when run a second time as there is no common unique identifier between the source and destination data to check against & therefore re-importing them will result in duplicate address rows.
- The function can be run idempotently if we change the last parameter in the `select imp.import_swrs_data(...)` function call from `true` to `false` (boolean value = "import_addresses" -> see function definition for more details).
- Changing this value will instruct the import function to ignore addresses in a subsequent run
- The job can now be created manually again in the OBPS namespace.

## Manual Testing:

- This import was manually tested in the following ways:
  - The set of results in the obps operator table is equal to the number of results from the initial swrs.organisation query used to pare down the results into unique operator rows where the operator submitted a swrs report in 2022.
  - The set of results in the obps operation table is equal to the number of results from the initial swrs.facilty query used to pare down the results into unique facility rows where the facility_type was either 'SFO' or 'LFO' and the facility submitted a swrs report in 2022.
  - The following union query was run on the output of the fdw import to ensure that the correct operations were associated to the correct operators in the obps operation table:

  ```sql
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
  select y.cra_business_number::integer, w.swrs_facility_id from w join y on w.swrs_organisation_id = y.swrs_organisation_id
  -- END SOURCE QUERY
  union
  -- BEGIN DESTINATION QUERY
  select cra_business_number, swrs_facility_id from erc.operation f join erc.operator o on f.operator_id = o.id;
  -- END DESTINATION QUERY
  ```

  The number of results did not differ after applying the union operator on the two queries. So there are no extraneous rows between the two queries where a facility / operation's swrs_facility_id has been associated incorrecty with a different organisation / operator's swrs_organisation_id.
  - The following similar query was run to ensure that no addresses were incorrectly associated with an operator after import:

  ```sql
  -- BEGIN SOURCE QUERY
  with x as (
  select max(o.report_id) as max_report_id, o.swrs_organisation_id from swrs.organisation o
  join swrs.report r on r.id = o.report_id
  and r.reporting_period_duration=2022
  group by o.swrs_organisation_id
  ) select
  o.cra_business_number::integer,
  concat_ws(' ',a.physical_address_unit_number, a.physical_address_street_number, a.physical_address_street_number_suffix, a.physical_address_street_name, a.physical_address_street_type, a.physical_address_street_direction) as physical_street_address,
  a.physical_address_municipality,
  a.physical_address_prov_terr_state,
  a.physical_address_postal_code_zip_code,
  concat_ws(' ',a.mailing_address_unit_number, a.mailing_address_street_number, a.mailing_address_street_number_suffix, a.mailing_address_street_name, a.mailing_address_street_type, a.mailing_address_street_direction) as mailing_street_address,
  a.mailing_address_municipality,
  a.mailing_address_prov_terr_state,
  a.mailing_address_postal_code_zip_code
  from swrs.organisation o
  join x on o.swrs_organisation_id = x.swrs_organisation_id
  and o.report_id = x.max_report_id
  join swrs.report r
  on r.id = o.report_id
  left join swrs.address a
  on a.organisation_id = o.id
  and a.path_context = 'RegistrationData'
  -- END SOURCE QUERY
  union
  -- BEGIN DESTINATION QUERY
  select cra_business_number::integer, pa.street_address, pa.municipality, pa.province, pa.postal_code, ma.street_address, ma.municipality, ma.province, ma.postal_code
  from erc.operator o
  join erc.address pa on o.physical_address_id = pa.id
  join erc.address ma on o.mailing_address_id = ma.id;
  -- END DESTINATION QUERY
  ```

  The results differed by 1 row as there is a duplicate organisation with matching cra_business_numbers, but different swrs_organisation_ids in the original query. This duplicate is normalized during the import to resolve to one operator. So, ignoring this duplicate row, there are no extraneous rows between the two queries where an address was incorrectly associated with an operator.
