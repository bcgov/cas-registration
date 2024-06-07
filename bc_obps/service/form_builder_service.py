import json
from reporting.models import ConfigurationElement, ReportingField, ActivitySourceTypeBaseSchema

## Return base schema for activity-sourceType pair if only those values are passed & append valid gas types to schema as enum
def build_activity_source_type_schema(activity: int, source_type: int, report_date: str):
    ## Fetch base schema for activity-sourceType pair
    source_type_schema = ActivitySourceTypeBaseSchema.objects.select_related('base_schema').filter(reporting_activity_id=activity, source_type_id=source_type, valid_from__valid_from__lte=report_date, valid_to__valid_to__gte=report_date).first()
    ## Fetch valid gas_type values for activity-sourceType pair
    gas_types=ConfigurationElement.objects.select_related('gas_type').filter(reporting_activity_id=activity, source_type_id=source_type, valid_from__valid_from__lte=report_date,).distinct('gas_type__name')
    gas_type_enum = []
    for t in gas_types:
        gas_type_enum.append(t.gas_type.chemical_formula)
    return_schema = source_type_schema.base_schema.schema
    ## Append valid gas types to schema as an enum on the gasType property
    return_schema['properties']['gasType']['enum'] = gas_type_enum
    ## Append other fields related to gas type to schema
    return_schema['properties']['emisisons'] = {"type": "number", "title": "Emissions"}
    return_schema['properties']['equivalentEmisisons'] = {"type": "number", "title": "Equivalent Emissions"}
    ## May need to return 2 objects here: the schema & a mapping for the gas_type.chemical_formula to gas_type.id for use in the frontend
    return json.dumps(return_schema)

def build_activity_source_type_gas_type_schema(activity: int, source_type: int, gas_type: int, report_date: str):
    source_type_schema = ActivitySourceTypeBaseSchema.objects.select_related('base_schema').filter(reporting_activity_id=activity, source_type_id=source_type, valid_from__valid_from__lte=report_date, valid_to__valid_to__gte=report_date).first()
    ## Fetch valid gas_type values for activity-sourceType pair
    gas_types=ConfigurationElement.objects.select_related('gas_type').filter(reporting_activity_id=activity, source_type_id=source_type, valid_from__valid_from__lte=report_date,).distinct('gas_type__name')
    gas_type_enum = []
    for t in gas_types:
        gas_type_enum.append(t.gas_type.chemical_formula)
    return_schema = source_type_schema.base_schema.schema
    ## Append valid gas types to schema as an enum on the gasType property
    return_schema['properties']['gasType']['enum'] = gas_type_enum
    ## Append other fields related to gas type to schema
    return_schema['properties']['emisisons'] = {"type": "number", "title": "Emissions"}
    return_schema['properties']['equivalentEmisisons'] = {"type": "number", "title": "Equivalent Emissions"}
    ## Fetch valid methodology values for activity-sourceType pair + gasType selection
    methodologies=ConfigurationElement.objects.select_related('methodology').filter(reporting_activity_id=activity, source_type_id=source_type, gas_type_id=gas_type, valid_from__valid_from__lte=report_date,)
    methdology_enum = []
    for t in methodologies:
        methdology_enum.append(t.methodology.name)
    ## Append methodology field to schema with valid methodologies as an enum
    return_schema['properties']['methodology'] = {"type": "string", "title": "Methodology", "enum": methdology_enum}
    return json.dumps(return_schema)

def build_full_schema(activity: int, source_type: int, gas_type: int, methodology: int, report_date: str):
  return f'GSC with all conditionals defined. Activity: {activity} SourceType: {source_type} GasType: {gas_type} Methodology: {methodology}'


class FormBuilderService:

    @classmethod
    def build_form_schema(request, activity=None, source_type=None, gas_type=None, methodology=None, report_date='2024-04-01'):
      if activity is None or source_type is None:
          return 'ERROR: Cannot build a schema without both Activity & Source Type data'
      elif gas_type is None:
          schema=build_activity_source_type_schema(activity, source_type, report_date)
      elif methodology is None:
          schema=build_activity_source_type_gas_type_schema(activity, source_type, gas_type, report_date)
      else:
          schema=build_full_schema(activity, source_type, gas_type, methodology, report_date)
      return schema
