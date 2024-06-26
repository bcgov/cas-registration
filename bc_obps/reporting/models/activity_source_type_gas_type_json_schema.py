from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import Configuration, SourceType, GasType
import typing
from reporting.utils import validate_overlapping_records


class ActivitySourceTypeGasTypeJsonSchema(BaseModel):
    """Intersection table for Activity-SourceType-JsonSchema for Emission schemas"""

    # No history needed, these elements are immutable
    reporting_activity = models.ForeignKey(ReportingActivity, on_delete=models.DO_NOTHING, related_name="+")
    source_type = models.ForeignKey(SourceType, on_delete=models.DO_NOTHING, related_name="+")
    gas_type = models.ForeignKey(GasType, on_delete=models.DO_NOTHING, related_name="+")
    json_schema = models.JSONField(
        db_comment="The json schema for a specific gas type given a source type & activity. This defines the shape of the data collected for emissions for the related gast ype",
    )
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table_comment = "Intersection table that assigns a json_schema for a gas_type (emission) as valid for a period of time given an activity & source type"
        db_table = 'erc"."activity_source_type_gas_type_json_schema'

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to validate if there are overlapping records.
        """
        exception_message = f'This record will result in duplicate json schemas being returned for the date range {self.valid_from.valid_from} - {self.valid_to.valid_to} as it overlaps with a current record or records'
        validate_overlapping_records(ActivitySourceTypeGasTypeJsonSchema, self, exception_message)
        super().save(*args, **kwargs)
