from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, GasType, Methodology, Configuration, ReportingField
import typing
from reporting.models.custom_methodology_schema import CustomMethodologySchema
from reporting.utils import validate_overlapping_records
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

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to validate if there are overlapping records.
        """
        exception_message = f'This record will result in duplicate configuration elements being returned for the date range {self.valid_from.valid_from} - {self.valid_to.valid_to} as it overlaps with a current record or records'

        validate_overlapping_records(ConfigurationElement, self, exception_message)
        super().save(*args, **kwargs)
