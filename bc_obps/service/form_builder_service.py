import json
from reporting.models import ConfigurationElement, SourceType, GasType, Methodology, ReportingField, ActivitySourceTypeBaseSchema
from registration.models import ReportingActivity



def get_config(activity_ids):
      # cached_data = cache.get("configuration_element")
      # if cached_data:
      #     return cached_data
      # else:
          config = ConfigurationElement.objects.all().prefetch_related("reporting_activity", "reporting_source_type", "reporting_gas_type", "reporting_methodology").filter(reporting_activity_id__in=activity_ids)
          # cache.set("configuration_element", config, 60 * 60 * 24 * 1)
          return config

def build_gsc_schema(gsc):
  print('ACTIVITY: ')
  print(gsc[1].reporting_activity.name)
  st = gsc.values('reporting_source_type_id').distinct()
  source_types = []
  for n in st:
    x = (n.get('reporting_source_type_id'))
    st_name=gsc.filter(reporting_source_type_id=x).first().reporting_source_type.name
    print('--------------')
    print('SOURCE TYPE ID: ', x, ' ', st_name)
    print('--------------')
    source_types.append(x)
    gt = gsc.filter(reporting_source_type_id=x).values('reporting_gas_type_id').distinct()
    for m in gt:
      y = (m.get('reporting_gas_type_id'))
      gt_name = gsc.filter(reporting_source_type_id=x, reporting_gas_type_id=y).first().reporting_gas_type.name
      print('--------------')
      print('GAS_TYPE_ID: ',y, ' ', gt_name)
      print('--------------')
      met = gsc.filter(reporting_source_type_id=x, reporting_gas_type_id=y).values('reporting_methodology_id').distinct()
      for o in met:
          z = (o.get('reporting_methodology_id'))
          met_name = gsc.filter(reporting_source_type_id=x, reporting_gas_type_id=y, reporting_methodology_id=z).first().reporting_methodology.name
          print('METHODOLOGY_ID: ', z, ' ', met_name)
          config_record = gsc.filter(reporting_activity_id=1, reporting_source_type_id=x, reporting_gas_type_id=y, reporting_methodology_id=z)
          for i in config_record:
              fields = ConfigElementReportingField.objects.all().prefetch_related("reporting_field").filter(configuration_element=i)
              for f in fields:
                  print ('FIELD NAME: ', f.reporting_field.field_name, 'FIELD_TYPE: ', f.reporting_field.field_type)


## Return base schema for activity-sourceType pair if only those values are passed & append valid gas types to schema as enum
def build_activity_source_type_schema(activity: int, source_type: int, report_date: str):
  ## Fetch base schema for activity-sourceType pair
  source_type_schema = ActivitySourceTypeBaseSchema.objects.select_related('base_schema').filter(reporting_activity_id=activity, source_type_id=source_type, valid_from__valid_from__lte=report_date, valid_to__valid_to__gte=report_date).first()
  ## Fetch valid gas_type values for activity-sourceType pair
  gas_types=ConfigurationElement.objects.select_related('gas_type').filter(reporting_activity_id=activity, source_type_id=source_type).distinct('gas_type__name')
  gas_type_enum = []
  for t in gas_types:
      gas_type_enum.append(t.gas_type.chemical_formula)
  return_schema = source_type_schema.base_schema.schema
  ## Append valid gas types to schema as an enum on the gasType property
  source_type_schema.base_schema.schema['properties']['gasType']['enum'] = gas_type_enum
  ## May need to return 2 objects here: the schema & a mapping for the gas_type.chemical_formula to gas_type.id for use in the frontend
  return json.dumps(return_schema)

def build_activity_source_type_gas_type_schema(activity: int, source_type: int, gas_type: int):
  return f'GSC with gas type. Activity: {activity} SourceType: {source_type} GasType: {gas_type}'

def build_full_schema(activity: int, source_type: int, gas_type: int, methodology: int):
  return f'GSC with all conditionals defined. Activity: {activity} SourceType: {source_type} GasType: {gas_type} Methodology: {methodology}'


class FormBuilderService:

    @classmethod
    def build_form_schema(request, activity=None, source_type=None, gas_type=None, methodology=None, report_date='2024-04-01'):
      if activity is None or source_type is None:
          return 'ERROR: Cannot build a schema without both Activity & Source Type data'
      elif gas_type is None:
          schema=build_activity_source_type_schema(activity, source_type, report_date)
      elif methodology is None:
          print('Here')
          schema=build_activity_source_type_gas_type_schema(activity, source_type, gas_type)
      else:
          schema=build_full_schema(activity, source_type, gas_type, methodology)
      return schema

    @classmethod
    def build_config_elements(request):
        activity_ids=[1]
        request.activity_id, ...
        config = get_config(activity_ids)
        schemas = {}
        gsc = config.filter(reporting_activity_id=1)
        # print(config[1].reporting_source_type.name)
        # print(gsc[1].reporting_source_type.name)
        build_gsc_schema(gsc)

        return config[5].reporting_source_type.name

    @classmethod
    def get_valid_gas_types(request, activity, source_type):
      gas_type_names = ConfigurationElement.objects.filter(reporting_activity_id=activity, reporting_source_type_id=source_type).prefetch_related('reporting_gas_type').values_list("reporting_gas_type__name", flat=True).distinct()
      return gas_type_names

    @classmethod
    def get_valid_methodologies(request, activity, source_type, gas_type):
      methodologies = ConfigurationElement.objects.filter(reporting_activity_id=activity, reporting_source_type_id=source_type, reporting_gas_type_id=gas_type).prefetch_related('reporting_methodology').values_list("reporting_methodology__name", flat=True).distinct()
      return methodologies

    @classmethod
    def get_config_fields(request, activity, source_type, gas_type, methodology):
      config_id = ConfigurationElement.objects.filter(reporting_activity_id=activity, reporting_source_type_id=source_type, reporting_gas_type_id=gas_type, reporting_methodology_id=methodology).first().id
      reporting_field_ids = ConfigElementReportingField.objects.filter(configuration_element__id=config_id).values_list("reporting_field", flat=True)
      reporting_fields = ReportingField.objects.filter(pk__in=reporting_field_ids)
      return json.dumps([field.serialize() for field in reporting_fields])


