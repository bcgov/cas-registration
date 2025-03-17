# CIIP - SWRS Import to OBPS

This directory contains all the files necessary to import IF_a, IF_b & L_c facility data from swrs into the obps database in openshift. When run, these functions populate the erc.facility, erc.address & erc.facility_designated_operation_timeline table.

## Contents

- **init.sql**: An sql file to add the necessary extensions & import schema.
- **obps_swrs_import_fdw.sql**: An sql file to create a foreign data wrapper to the SWRS database.
- **obps_import_swrs_data_from_fdw.sql**: An sql file to import the data from the fdw into the OBPS database.
- **documentation**: Directory containing the queries that were run to test & validate the success of the import script & some results from those queries.

## Notes

- There are 5 LFO operations in the OBPS data that do not have swrs_facility_ids associated with them. These operations will have no facilities attached to them after the import.
- There are 2 LFO facilities in SWRS that are in the OBPS system, but did not report to SWRS in 2023. No facilities will be imported for these LFO operations:
  - Calima LFO
  - TAQA BC LFO
- There is one LFO facility in swrs that reported in 2023 ("BSRL BC LFO") that does not have a matching LFO operation in OBPS.

## How to run the import:

- Create a temporary network policy that allows the OBPS namespace to read the SWRS database namespace
- In the master postgres pod terminal, copy the contents of the 3 SQL files in this order:
  - init.sql
  - obps_import_swrs_data_from_fdw.sql
  - obps_swrs_import_fdw.sql
- Call the function with the swrs database credentials:
  - `select imp.import_swrs_data('<swrs host>', '<swrs database>', '<swrs db port>', '<swrs user>', '<swrs password>')`
- The import should be complete. Check the data in the database.
- Delete the temporary network policy

## Manual Testing:

- This import was manually tested in the following ways:

1. The number of IF_a, IF_b & L_c facilities in swrs were counted & grouped by their parent_facility's swrs_facility_id using the query in `/queries/swrs/child_facilities_grouped_by_parent_id.sql`. This was used as a baseline to check the results of the import against.
2. After a test import, a similar query was performed on the OBPS data using the query in `/queries/obps/child_facilities_grouped_by_parent_operation.sql`. The swrs_facility_ids & the number of child facilities associated to each was found to match the initial swrs query except for one record: LFO "BSRL BC LFO" does not exist in the OBPS data. So there is one extra record in the initial swrs query.
3. The facility_designated_operation_timeline relationships was tested in the same way using the query in `/queries/obps/timeline_data_grouped_by_parent_operation.sql`. The results matched the initial swrs query except for one record: LFO with "BSRL BC LFO" does not exist in the OBPS data. So there is one extra record in the initial swrs query.
4. The number of results returned by the SWRS query in `queries/swrs/LFO_child_facilties_2023` was 455. This matches the number of records (453) in the erc.facility table after the import minus the 2 child facilities of LFO "BSRL BC LFO" which not exist in the OBPS data.
