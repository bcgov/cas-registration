from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import SourceType, GasType, Methodology, Configuration, ReportingField
import typing


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

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to validate if there are overlapping records.
        """
        all_ranges = ConfigurationElement.objects.select_related('valid_from', 'valid_to').filter(
            reporting_activity=self.reporting_activity,
            source_type=self.source_type,
            gas_type=self.gas_type,
            methodology=self.methodology,
        )
        for y in all_ranges:
            if (
                (self.valid_from.valid_from >= y.valid_from.valid_from)
                and (self.valid_from.valid_from <= y.valid_to.valid_to)
                or (self.valid_to.valid_to <= y.valid_to.valid_to)
                and (self.valid_to.valid_to >= y.valid_from.valid_from)
            ):
                raise Exception(
                    f'This record will result in duplicate configurations being returned for the date range {self.valid_from.valid_from} - {self.valid_to.valid_to} as it overlaps with a current record or records'
                )
        super().save(*args, **kwargs)
