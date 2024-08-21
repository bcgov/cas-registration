# Activity Forms

## Steps to build an activity form

The data needed to create a configuration in the database is in the BCIERS Reporting Fields V2 excel file. The file can be
found in our SME channel under the Reporting App directory.

### Configurations

Create an empty migration with the name of the activity (if it's a really long name abbreviate it appropriately)
Use the data in the excel file to create the configurations in the database. (example in the general_stationary_combusion_data migration - `init_configuration_element_data())`

Example:

In this example we are creating a config element that ends up like this in the database:
(activity_id, source_type_id, gas_type_id, methodology_id. valid_from_id, valid_to_id) = (1,1,1,1,1,1,1)

```
  ConfigurationElement(
      activity_id=Activity.objects.get(name='General stationary combustion excluding line tracing').id,
      source_type_id=SourceType.objects.get(
          name='General stationary combustion of fuel or waste with production of useful energy'
      ).id,
      gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
      methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
      valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
      valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
  )
```

- Each activity may have more than one source type
- Each source type likely has multiple gases that can be reported
- Each gas type likely has multiple methodologies that can be applied
- All of these scenarios need to be captured as a configuration element

Some methodologies may have specific data fields that need to be collected, which means adding some many-to-many relationships

- If the dependent field doesn't exist in the reporting_fields table, add it in the migration (example: `init_reporting_field_data()`). Otherwise use the field that already exists
- Example of how the many-to-many relationship is added is in the general_stationary_combusion_data migration `init_configuration_element_reporting_fields_data()`
- Some methodologies do not have specific data fields that need to be collected & you can skip this step

### RJSF Schema

Add the necessary RJSF schemas to the bc_obps/reporting/json_schemas/2024/{your activity}/ directory

- An activity schema is needed that includes any activity-specific fields (most activities don't have any of these, so the schema will be pretty empty)
- A schema for each source type is also needed & should include the unit array object (if needed), fuel array object (if needed) and the emission array object with any fields under those objects as defined in the excel file
- The [RJSF Playground](https://rjsf-team.github.io/react-jsonschema-form/) is really helpful for visualizing what the schemas may look like

Once the schemas are created, they need to be added to the database in the migration for the activity. An example of how to add the schemas via a migration is in the general_stationary_combusion_data migration - `init_activity_schema_data()` & `init_activity_source_type_schema_data()` functions.

- Make sure to set the has_unit and/or has_fuel booleans to false if the source type does not include that data.

### Frontend

On the frontend:

- Create a directory for the activity under `bceidbusiness/industry_user_admin/reports/[version_id]/facilities/[facility_idid]/activities`
- Add a page.tsx route file - see the gsc_excluding_line_tracing directory for an example
- Add a component for the activity under `components/activities` - see the generalStationaryCombustion.tsx file for an example
- Create a uiSchema in the activity component. These will eventually live in the database, but for ease of development they can live here for now.
- The ActivityForm.tsx file is a generic component to render the form it _shouldn't_ need any changes

Once the activity form page is working properly. Copy the new activity directory from under the `industry_user_admin` role to the `industry_user` role directory in the same place. Both user types should be able to access these pages.
