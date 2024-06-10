import json
from reporting.models import ConfigurationElement, ReportingField, ActivitySourceTypeBaseSchema

# Helper function to dynamically set the RJSF property value of a field from a Title cased name
def camelCase(st):
    output = ''.join(x for x in st.title() if x.isalnum())
    return output[0].lower() + output[1:]

def build_schema(activity: int, source_type: int, gas_type: int, methodology: int, report_date: str):
    source_type_schema = ActivitySourceTypeBaseSchema.objects.select_related('base_schema').filter(reporting_activity_id=activity, source_type_id=source_type, valid_from__valid_from__lte=report_date, valid_to__valid_to__gte=report_date).first()
    ## Fetch valid gas_type values for activity-sourceType pair
    gas_types=ConfigurationElement.objects.select_related('gas_type').filter(reporting_activity_id=activity, source_type_id=source_type, valid_from__valid_from__lte=report_date,).distinct('gas_type__name')
    gas_type_enum = []
    for t in gas_types:
        gas_type_enum.append(t.gas_type.chemical_formula)
    return_schema = source_type_schema.base_schema.schema
    ## Append valid gas types to schema as an enum on the gasType property
    return_schema['properties']['gasType']['enum'] = gas_type_enum
    if gas_type:
        return_schema['properties']['emissions'] = {"type": "number", "title": "Emissions"}
        return_schema['properties']['equivalentEmisisons'] = {"type": "number", "title": "Equivalent Emissions"}
        ## Fetch valid methodology values for activity-sourceType pair + gasType selection
        methodologies=ConfigurationElement.objects.select_related('methodology').filter(reporting_activity_id=activity, source_type_id=source_type, gas_type_id=gas_type, valid_from__valid_from__lte=report_date,)
        methdology_enum = []
        for t in methodologies:
            methdology_enum.append(t.methodology.name)
        ## Append methodology field to schema with valid methodologies as an enum
        return_schema['properties']['methodology'] = {"type": "string", "title": "Methodology", "enum": methdology_enum}
    if methodology:
        methodology_fields=ConfigurationElement.objects.prefetch_related('reporting_fields').get(reporting_activity_id=activity, source_type_id=source_type, gas_type_id=gas_type, methodology_id=methodology).reporting_fields.all()
        for f in methodology_fields:
            property_field = camelCase(f.field_name)
            return_schema['properties'][property_field] = {"type": f.field_type, "title": f.field_name}
            if f.field_units:
                return_schema['properties'][f"{property_field}FieldUnits"] = {"type": "string", "default": f.field_units}
    return json.dumps(return_schema)


class FormBuilderService:

    @classmethod
    def build_form_schema(request, activity=None, source_type=None, gas_type=None, methodology=None, report_date='2024-04-01'):
      if report_date is None:
          return 'ERROR: Cannot build a schema without a valid report date'
      if activity is None or source_type is None:
          return 'ERROR: Cannot build a schema without both Activity & Source Type data'
      schema = build_schema(activity, source_type, gas_type, methodology, report_date)
      return schema
