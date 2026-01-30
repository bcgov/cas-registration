from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, GasType, Methodology, Configuration, ReportingField
from reporting.models.custom_methodology_schema import CustomMethodologySchema
from reporting.models.rls_configs.configuration_element import Rls as ConfigurationElementRls


class ConfigurationElement(BaseModel):
    """Configuration element for reporting"""

    # No history needed, these elements are immutable
    activity = models.ForeignKey(Activity, on_delete=models.DO_NOTHING, related_name="configuration_elements")
    source_type = models.ForeignKey(SourceType, on_delete=models.DO_NOTHING, related_name="configuration_elements")
    gas_type = models.ForeignKey(GasType, on_delete=models.DO_NOTHING, related_name="configuration_elements")
    methodology = models.ForeignKey(Methodology, on_delete=models.DO_NOTHING, related_name="configuration_elements")
    custom_methodology_schema = models.ForeignKey(
        CustomMethodologySchema,
        on_delete=models.DO_NOTHING,
        related_name="configuration_elements",
        null=True,
        blank=True,
    )
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

    Rls = ConfigurationElementRls
