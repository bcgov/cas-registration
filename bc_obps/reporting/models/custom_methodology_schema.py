from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import Configuration, SourceType, GasType, Methodology
from reporting.models.rls_configs.custom_methodology_schema import Rls as CustomMethodologySchemaRls


class CustomMethodologySchema(BaseModel):
    """Custom schema for a methodology."""

    activity = models.ForeignKey(
        Activity,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="Activity needing this custom methodology schema. It may have more than one source type. Foreign key to erc.activity table",
    )
    source_type = models.ForeignKey(
        SourceType,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="Source type the activity reports in this schema. Likely has multiple gas types. Foreign key to erc.source_type table",
    )
    gas_type = models.ForeignKey(
        GasType,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="Gas type the source type reports in this schema. Likely has multiple methodologies. Foreign key to erc.gas_type table",
    )
    methodology = models.ForeignKey(
        Methodology,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="Methodology the gas type reports in this schema. Foreign key to erc.methodology table",
    )
    json_schema = models.JSONField(db_comment="JSON schema defining the custom fields for this methodology")
    valid_from = models.ForeignKey(
        Configuration,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="Start of the validity period for this schema, according to reporting year. Foreign key to erc.configuration table",
    )
    valid_to = models.ForeignKey(
        Configuration,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="End of the validity period for this schema, according to reporting year. Foreign key to erc.configuration table",
    )

    class Meta:
        db_table = 'erc"."custom_methodology_schema'
        db_table_comment = "Custom methodology schema used to define additional fields for reporting"

    Rls = CustomMethodologySchemaRls
