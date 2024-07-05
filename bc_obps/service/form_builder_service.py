import json
from reporting.models import ConfigurationElement, ActivitySourceTypeBaseSchema

# Helper function to dynamically set the RJSF property value of a field from a Title cased name
def camelCase(st):
    output = ''.join(x for x in st.title() if x.isalnum())
    return output[0].lower() + output[1:]


def build_schema(activity: int, source_type: int, gas_type: int, methodology: int, report_date: str):
    source_type_schema = (
        ActivitySourceTypeBaseSchema.objects.select_related('base_schema')
        .filter(
            reporting_activity_id=activity,
            source_type_id=source_type,
            valid_from__valid_from__lte=report_date,
            valid_to__valid_to__gte=report_date,
        )
        .first()
    )
    if source_type_schema is None:
        raise Exception(
            f'No base schema found for activity_id {activity} & source_type_id {source_type} & report_date {report_date}'
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
    gas_type_map = {}
    methodology_map = {}
    for t in gas_types:
        gas_type_enum.append(t.gas_type.chemical_formula)
        gas_type_map[t.gas_type.id] = t.gas_type.chemical_formula
    rjsf_schema = source_type_schema.base_schema.schema
    ## Append valid gas types to schema as an enum on the gasType property
    rjsf_schema['properties']['gasType']['enum'] = gas_type_enum

    if gas_type:
        rjsf_schema['properties']['emissions'] = {"type": "number", "title": "Emissions"}
        rjsf_schema['properties']['equivalentEmissions'] = {"type": "number", "title": "Equivalent Emissions"}
        ## Fetch valid methodology values for activity-sourceType pair + gasType selection
        methodologies = ConfigurationElement.objects.select_related('methodology').filter(
            reporting_activity_id=activity,
            source_type_id=source_type,
            gas_type_id=gas_type,
            valid_from__valid_from__lte=report_date,
            valid_to__valid_to__gte=report_date,
        )
        if not methodologies.exists():
            raise Exception(
                f'No configuration found for activity_id {activity} & source_type_id {source_type} & gas_type_id {gas_type} & report_date {report_date}'
            )
        methodology_enum = []
        for t in methodologies:
            methodology_enum.append(t.methodology.name)
            methodology_map[t.methodology.id] = t.methodology.name
        ## Append methodology field to schema with valid methodologies as an enum
        rjsf_schema['properties']['methodology'] = {"type": "string", "title": "Methodology", "enum": methodology_enum}

    if methodology:
        try:
            methodology_fields = (
                ConfigurationElement.objects.prefetch_related('reporting_fields')
                .get(
                    reporting_activity_id=activity,
                    source_type_id=source_type,
                    gas_type_id=gas_type,
                    methodology_id=methodology,
                    valid_from__valid_from__lte=report_date,
                    valid_to__valid_to__gte=report_date,
                )
                .reporting_fields.all()
            )
        except:
            raise Exception(
                f'No configuration found for activity_id {activity} & source_type_id {source_type} & gas_type_id {gas_type} & methodology_id {methodology} & report_date {report_date}'
            )
        for f in methodology_fields:
            property_field = camelCase(f.field_name)
            rjsf_schema['properties'][property_field] = {"type": f.field_type, "title": f.field_name}
            if f.field_units:
                rjsf_schema['properties'][f"{property_field}FieldUnits"] = {"type": "string", "default": f.field_units}
    # Create a return object that includes the rjsf schema & an id-name mapping for gas_types & methodologies
    return_object = {}
    return_object["schema"] = rjsf_schema
    return_object["gasTypeMap"] = gas_type_map
    return_object['methodologyMap'] = methodology_map
    return json.dumps(return_object)


class FormBuilderService:
    @classmethod
    def build_form_schema(
        request, activity=None, source_type=None, gas_type=None, methodology=None, report_date='2024-04-01'
    ):
        if report_date is None:
            raise Exception('Cannot build a schema without a valid report date')
        if activity is None or source_type is None:
            raise Exception('ERROR: Cannot build a schema without both Activity & Source Type data')
        schema = build_schema(activity, source_type, gas_type, methodology, report_date)
        return schema
