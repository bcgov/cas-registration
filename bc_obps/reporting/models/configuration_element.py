from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import SourceType, GasType, Methodology, Configuration, ReportingField
from django.db.models.constraints import UniqueConstraint


class ConfigurationElement(BaseModel):
    """Configuration element for reporting"""

    # No history needed, these elements are immutable
    reporting_activity = models.ForeignKey(
        ReportingActivity, on_delete=models.DO_NOTHING, related_name="configuration_elements"
    )
    source_type = models.ForeignKey(SourceType, on_delete=models.DO_NOTHING, related_name="configuration_elements")
    gas_type = models.ForeignKey(GasType, on_delete=models.DO_NOTHING, related_name="configuration_elements")
    methodology = models.ForeignKey(Methodology, on_delete=models.DO_NOTHING, related_name="configuration_elements")
    reporting_fields = models.ManyToManyField(
        ReportingField,
        blank=True,
        related_name="configuration_elements",
    )
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table_comment = "Element of a configuration, representing a single relationship between multiple entities. Used to define an allowable activity-sourceType-gasType-methodology relationship as per WCI"
        db_table = 'erc"."configuration_element'
        constraints = [
            UniqueConstraint(
                fields=[
                    'reporting_activity',
                    'source_type',
                    'gas_type',
                    'methodology',
                    'valid_from',
                    'valid_to',
                ],
                name='unique_per_config',
            )
        ]
