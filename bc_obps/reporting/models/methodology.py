from common.models import BaseModel
from django.db import models
from reporting.models.rls_configs.methodology import Rls as MethodologyRls


class Methodology(BaseModel):
    """Reporting methodology"""

    name = models.CharField(max_length=1000, db_comment="The name of a reporting methodology")

    class Meta:
        db_table_comment = "Table contains the set of reporting methodologies that can be applied to an emission as outlined in GGERR (Greenhous Gas Emission Reporting Regulation)"
        db_table = 'erc"."methodology'

    Rls = MethodologyRls
