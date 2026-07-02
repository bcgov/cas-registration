from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, GasType, Methodology, Configuration, ReportingField
from reporting.models.custom_methodology_schema import CustomMethodologySchema
from reporting.models.rls_configs.configuration_element import Rls as ConfigurationElementRls
from reporting.models.triggers import no_overlapping_configuration_records_trigger


class ConfigurationElement(BaseModel):
    """Configuration element for reporting"""

    # No history needed, these elements are immutable
    activity = models.ForeignKey(
        Activity,
        on_delete=models.DO_NOTHING,
        related_name="configuration_elements",
        db_comment="Activity defining this configuration element. It may have more than one source type. Foreign key to erc.activity table",
    )
    source_type = models.ForeignKey(
        SourceType,
        on_delete=models.DO_NOTHING,
        related_name="configuration_elements",
        db_comment="Source type the activity reports in this configuration. Likely has multiple gas types. Foreign key to erc.source_type table",
    )
    gas_type = models.ForeignKey(
        GasType,
        on_delete=models.DO_NOTHING,
        related_name="configuration_elements",
        db_comment="Gas type the source type reports in this configuration. Likely has multiple methodologies. Foreign key to erc.gas_type table",
    )
    methodology = models.ForeignKey(
        Methodology,
        on_delete=models.DO_NOTHING,
        related_name="configuration_elements",
        db_comment="Methodology the gas type reports in this configuration. Foreign key to erc.methodology table",
    )
    custom_methodology_schema = models.ForeignKey(
        CustomMethodologySchema,
        on_delete=models.DO_NOTHING,
        related_name="configuration_elements",
        null=True,
        blank=True,
        db_comment="Custom methodology schema included if additional custom reporting fields are needed. Foreign key to erc.custom_methodology_schema table",
    )
    reporting_fields = models.ManyToManyField(
        ReportingField,
        blank=True,
        related_name="configuration_elements",
    )
    valid_from = models.ForeignKey(
        Configuration,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="Start of the validity period for this configuration, according to reporting year. Foreign key to erc.configuration table",
    )
    valid_to = models.ForeignKey(
        Configuration,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="End of the validity period for this configuration, according to reporting year. Foreign key to erc.configuration table",
    )

    class Meta:
        db_table_comment = "Element of a configuration, representing a single relationship between multiple entities. Used to define an allowable activity-sourceType-gasType-methodology relationship as per WCI"
        db_table = 'erc"."configuration_element'
        triggers = [
            no_overlapping_configuration_records_trigger(
                message="This record will result in duplicate configuration elements being returned for the date range % - % as it overlaps with a current record or records",
                additional_filters=["source_type", "gas_type", "methodology"],
            ),
        ]

    Rls = ConfigurationElementRls
