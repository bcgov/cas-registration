from typing import  Union

from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.configuration_element import ConfigurationElement

def validate_overlapping_records(object_class: Union[ActivityJsonSchema, ActivitySourceTypeJsonSchema, ConfigurationElement], save_self: Union[ActivityJsonSchema, ActivitySourceTypeJsonSchema, ConfigurationElement], exception_message: str) -> None:
    all_ranges = object_class.objects.select_related('valid_from', 'valid_to').filter(
        reporting_activity=save_self.reporting_activity, source_type=save_self.source_type
    )
    for y in all_ranges:
        if (
            (save_self.valid_from.valid_from >= y.valid_from.valid_from)
            and (save_self.valid_from.valid_from <= y.valid_to.valid_to)
        ) or (
            (save_self.valid_to.valid_to <= y.valid_to.valid_to)
            and (save_self.valid_to.valid_to >= y.valid_from.valid_from)
        ):
            raise Exception(exception_message)
