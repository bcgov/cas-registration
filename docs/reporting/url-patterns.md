# URL patterns to use when building report pages:

URLs shall attempt to best describe what the page contains, in an unambiguous way.
Using IDs instead of GUIDs will let users validate the URLs at a glance.

- This allows the user to confirm it's the right page just by looking at the URL
- This allows the user to target each page of the report, to enter data and communicate with others

## Main Reporting Dashboard

| Page                       | URL                                | Comments                                                                                                   |
| -------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Report list - current year | `/reports`                         |                                                                                                            |
| Report list - past years   | `/reports/previous_years`          |                                                                                                            |
| Report - View              | `/reports/{report_version_id}`     | Using a specific version will allow us to link to past revisions. May redirect to a more appropriate place |
| Report - Edit              | `/reports/{report_version_id}/***` | General pattern for the pages                                                                              |

## Operation Information

| Page                  | URL                                            | Comments |
| --------------------- | ---------------------------------------------- | -------- |
| Operation Information | `/reports/{version_id}/review_operator_data`   |          |
| Review Facilities     | `/reports/{version_id}/review_facilities_list` |          |

## Facilities Information (emissions report)

For each facility:

| Page                                       | URL                                                              | Comments                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Review facility information                | `/reports/{version_id}/facilities/{facility_id}/review`          |                                                                                |
| Activities Information (for each activity) | `/reports/{version_id}/facilities/{id}/activities/{activity_id}` | The activity ID will let us fetch the proper configuration and build the forms |
| Non-attributable emissions                 | `/reports/{version_id}/facilities/{id}/non_attributable`         |                                                                                |
| Emissions Summary                          | `/reports/{version_id}/facilities/{id}/summary`                  |                                                                                |
| Production Data                            | `/reports/{version_id}/facilities/{id}/production`               |                                                                                |

## Other Pages (Compliance, Sign-off, Submit...)

| Page | URL                               | Comments                                                 |
| ---- | --------------------------------- | -------------------------------------------------------- |
| \*   | `/reports/{version_id}/page_name` | Use `page_name` to describe best what this page contains |
