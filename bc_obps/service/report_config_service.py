import json
from math import ceil
from reporting.schema.config import ConfigOut
from reporting.models import ConfigurationElement, ReportingGasType, ConfigElementReportingField, ReportingField
from django.core.cache import cache
from typing import List
from pprint import pprint
from django.forms import model_to_dict
from ninja import Field, FilterSchema, ModelSchema, Schema
from django.http import JsonResponse



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


class ReportConfigService:

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

