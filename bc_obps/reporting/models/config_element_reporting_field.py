from common.models import BaseModel
from django.db import models
from reporting.models import ConfigurationElement, ReportingField


class ConfigElementReportingField(BaseModel):
    """Conditional Reporting Fields"""

    # No history needed, these elements are immutable
    configuration_element = models.ForeignKey(
        ConfigurationElement, on_delete=models.DO_NOTHING, related_name="configuration_elements"
    )
    reporting_field = models.ForeignKey(
        ReportingField, on_delete=models.DO_NOTHING, related_name="reporting_fields"
    )


    class Meta:
        db_table_comment = "An intersection table that defines many to many relationships between the configuration_element table and the reporting_field table"
        db_table = 'erc"."config_element_reporting_field'
