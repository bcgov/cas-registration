from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import ReportingSourceType, ReportingGasType, ReportingMethodology, Configuration
from django.db.models.constraints import UniqueConstraint


class ConfigurationElement(BaseModel):
    """Configuration element for reporting"""

    # No history needed, these elements are immutable
    reporting_activity = models.ForeignKey(
        ReportingActivity, on_delete=models.DO_NOTHING, related_name="configuration_elements"
    )
    reporting_source_type = models.ForeignKey(
        ReportingSourceType, on_delete=models.DO_NOTHING, related_name="configuration_elements"
    )
    reporting_gas_type = models.ForeignKey(
        ReportingGasType, on_delete=models.DO_NOTHING, related_name="configuration_elements"
    )
    reporting_methodology = models.ForeignKey(
        ReportingMethodology, on_delete=models.DO_NOTHING, related_name="configuration_elements"
    )
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table_comment = "Element of a configuration, representing a single relationship between multiple entities"
        db_table = 'erc"."configuration_element'
        constraints = [
            UniqueConstraint(
                fields=[
                    'reporting_activity',
                    'reporting_source_type',
                    'reporting_gas_type',
                    'reporting_methodology',
                    'valid_from',
                    'valid_to',
                ],
                name='unique_per_config',
            )
        ]
