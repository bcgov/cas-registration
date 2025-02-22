from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import Configuration, SourceType, GasType, Methodology
from reporting.models.rls_configs.custom_methodology_schema import Rls as CustomMethodologySchemaRls


class CustomMethodologySchema(BaseModel):
    """Custom schema for a methodology."""

    activity = models.ForeignKey(Activity, on_delete=models.DO_NOTHING, related_name="+")
    source_type = models.ForeignKey(SourceType, on_delete=models.DO_NOTHING, related_name="+")
    gas_type = models.ForeignKey(GasType, on_delete=models.DO_NOTHING, related_name="+")
    methodology = models.ForeignKey(Methodology, on_delete=models.DO_NOTHING, related_name="+")
    json_schema = models.JSONField()
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table = 'erc"."custom_methodology_schema'
        db_table_comment = "Custom methodology schema used to define additional fields for reporting"

    Rls = CustomMethodologySchemaRls
