import json
from reporting.models import ConfigurationElement, ActivityJsonSchema, ActivitySourceTypeJsonSchema
from typing import List

# Helper function to dynamically set the RJSF property value of a field from a Title cased name
def str_to_camel_case(st):
    output = ''.join(x for x in st.title() if x.isalnum())
    return output[0].lower() + output[1:]

# Called by build_schema. Builds the source type schema including gas_type & methodology dependencies
def build_source_type_schema(activity, source_type, report_date, rjsf_schema, gas_type_map, methodology_map):
    source_type_schema = (
            ActivitySourceTypeJsonSchema.objects
            .get(
                reporting_activity_id=activity,
                source_type_id=source_type,
                valid_from__valid_from__lte=report_date,
                valid_to__valid_to__gte=report_date,
            )
        )
    if source_type_schema is None:
        raise Exception(
            f'No schema found for activity_id {activity} & source_type_id {source_type} & report_date {report_date}'
        )
    # Fetch valid gas_type values for activity-sourceType pair
    gas_types = (
        ConfigurationElement.objects.select_related('gas_type')
        .filter(
            reporting_activity_id=activity,
            source_type_id=source_type,
            valid_from__valid_from__lte=report_date,
        )
        .distinct('gas_type__name')
    )
    gas_type_enum = []
    # Maps of the gas_type & methodology objects will be passed in the return object so we have the IDs on the frontend.
    gas_type_one_of = {
      "gasType": {
        "oneOf":[]
      }
    }
    # For each gas type, add to the enum object to be added to the schema to complete the list of valid gas_types a user can select
    for index, t in enumerate(gas_types):
        gas_type_enum.append(t.gas_type.chemical_formula)
        gas_type_map[t.gas_type.id] = t.gas_type.chemical_formula
        methodologies = ConfigurationElement.objects.select_related('methodology').filter(
            reporting_activity_id=activity,
            source_type_id=source_type,
            gas_type_id=t.gas_type.id,
            valid_from__valid_from__lte=report_date,
            valid_to__valid_to__gte=report_date,
        )
        if not methodologies.exists():
            raise Exception(
                f'No configuration found for activity_id {activity} & source_type_id {source_type} & gas_type_id {t.gas_type.id} & report_date {report_date}'
            )
        # Create the oneOf branch for each gasType selection
        gas_type_one_of['gasType']['oneOf'].append({"properties": {"gasType": {"enum": [t.gas_type.chemical_formula]}, "methodology": {"title": "Methodology", "type": "string", "enum": []}}})

        methodology_enum = []
        methodology_one_of = {
              "methodology": {
                "oneOf":[]
              }
            }
        # For each allowed methodology for the activity-sourceType-gasType relationship, populate the enum with valid methodologies & create the oneOf branch for each methodology selection
        for u in methodologies:
            methodology_enum.append(u.methodology.name)
            methodology_map[u.methodology.id] = u.methodology.name
            try:
              methodology_fields = (
                  ConfigurationElement.objects.prefetch_related('reporting_fields')
                  .get(
                      reporting_activity_id=activity,
                      source_type_id=source_type,
                      gas_type_id=t.gas_type.id,
                      methodology_id=u.methodology.id,
                      valid_from__valid_from__lte=report_date,
                      valid_to__valid_to__gte=report_date,
                  )
                  .reporting_fields.all()
              )
            except:
                raise Exception(
                    f'No configuration found for activity_id {activity} & source_type_id {source_type} & gas_type_id {t.gas_type.id} & methodology_id {u.methodology.id} & report_date {report_date}'
                )
            methodology_object = {"properties": {"methodology": {"enum": [u.methodology.name]}}}
            # For each field related to a methodology, add that field to the methodology object & append to the oneOf branch
            for f in methodology_fields:
                property_field = str_to_camel_case(f.field_name)
                methodology_object['properties'][property_field] = {"type": f.field_type, "title": f.field_name}
                if f.field_units:
                    methodology_object['properties'][f"{property_field}FieldUnits"] = {"type": "string", "default": f.field_units, "title": f"{f.field_name} Units"}
            methodology_one_of['methodology']['oneOf'].append(methodology_object)
        gas_type_one_of['gasType']['oneOf'][index]['properties']['methodology']['enum'] = methodology_enum
        gas_type_one_of['gasType']['oneOf'][index]['dependencies'] = methodology_one_of


    st_schema = source_type_schema.json_schema
    # Append valid gas types to schema as an enum on the gasType property. Uses the has_unit / has_fuel booleans to determine the depth of the emissions array.
    if source_type_schema.has_unit and source_type_schema.has_fuel:
        st_schema['properties']['units']['items']['properties']['fuels']['items']['properties']['emissions']['items']['properties']['gasType']['enum'] = gas_type_enum
        st_schema['properties']['units']['items']['properties']['fuels']['items']['properties']['emissions']['items']['dependencies'] = gas_type_one_of
    elif not source_type_schema.has_unit and source_type_schema.has_fuel:
        st_schema['properties']['fuels']['items']['properties']['emissions']['items']['properties']['gasType']['enum'] = gas_type_enum
        st_schema['properties']['fuels']['items']['properties']['emissions']['items']['dependencies'] = gas_type_one_of
    else:
        st_schema['properties']['emissions']['items']['properties']['gasType']['enum'] = gas_type_enum
        st_schema['properties']['emissions']['items']['dependencies'] = gas_type_one_of
    # Add the source_type schema to the schema object being returned by this function
    rjsf_schema['properties']['sourceTypes']['properties'][str_to_camel_case(source_type_schema.source_type.name)] = st_schema


# build_schema will dynamically create a form depending on the parameters passed
# activity: Returns a form with just the activity schema + the set of related source_types
# activity + source_type(s): Returns the activity schema, plus the schema(s) for each source type id passed in the List, plus fills the gas_type enum with the valid gas types based on the activity & source type
# activity + source_type(s) + gas_type selection is made: Returns all of the above, plus fills out the methodology enum with the valid methodology options based on the activity, source_type & gas_type selected
# activity + source_type(s) + gas_type selection + methodology selection is made: Returns all of the above, plus the additional reporting fields associated to the methodology selection
# report_date is mandatory & determines the valid schemas & WCI configuration for the point in time that the report was created

def build_schema(activity: int, source_types: List[int], report_date: str):
    # Get activity schema
    rjsf_schema = ActivityJsonSchema.objects.filter(
            reporting_activity_id=activity,
            valid_from__valid_from__lte=report_date,
            valid_to__valid_to__gte=report_date
        ).first().json_schema
    gas_type_map = {}
    methodology_map = {}

    # Fetch valid source_type(s) for the activity
    valid_source_types = ConfigurationElement.objects.select_related('source_type').filter(
        reporting_activity_id=activity,
        valid_from__valid_from__lte=report_date,
        valid_to__valid_to__gte=report_date
    ).distinct('source_type__id')

    # Except if no valid source_types are found
    if valid_source_types.count() == 0:
        raise Exception(
            f'No valid source_types found for activity_id {activity} & report_date {report_date}'
        )
    # If an activity only has one source_type, the source type is mandatory and should be added to the schema
    elif valid_source_types.count() == 1:
        rjsf_schema['properties']['sourceTypes'] = {"type": "object", "title": "Source Types", "properties": {}}
        build_source_type_schema(activity, valid_source_types[0].source_type_id, report_date, rjsf_schema, gas_type_map, methodology_map)

    # If there are multiple source_types for an activity, the user may choose which ones apply. The IDs of the selected source_types are passed as a list in the parameters & we add those schemas to the activity schema.
    else:
        for s in valid_source_types:
            rjsf_schema['properties'][str_to_camel_case(s.source_type.name)] = {"type": "boolean", "title": s.source_type.name}

    # If no source_types are passed & there are more than 1 valid source type, only return the activity schema
    if len(source_types) == 0 and valid_source_types.count() > 1:
        return json.dumps(rjsf_schema)

    if (len(source_types) > 1):
        # Create the Source Types object (within which all the selected source_type schemas will be defined)
        rjsf_schema['properties']['sourceTypes'] = {"type": "object", "title": "Source Types", "properties": {}}
        # For each selected source_type, add the related schema
        for source_type in source_types:
            build_source_type_schema(activity, source_type, report_date, rjsf_schema, gas_type_map, methodology_map)

    # Return completed schema
    return_object = {}
    return_object["schema"] = rjsf_schema
    return_object["gasTypeMap"] = gas_type_map
    return_object['methodologyMap'] = methodology_map
    return json.dumps(return_object)


class FormBuilderService:
    @classmethod
    def build_form_schema(
        request, activity=None, source_types=[], report_date='2024-04-01'
    ):
        if report_date is None:
            raise Exception('Cannot build a schema without a valid report date')
        if activity is None:
            raise Exception('ERROR: Cannot build a schema without Activity data')
        schema = build_schema(activity, source_types, report_date)
        return schema
