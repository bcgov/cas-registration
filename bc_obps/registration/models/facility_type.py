from common.models import BaseModel
from django.db import models
from registration.models import OperationType
from simple_history.models import HistoricalRecords


class FacilityType(BaseModel):
    name = models.CharField(primary_key=True, max_length=1000, db_comment="The name of a facility type")
    operation_type = models.ForeignKey(
        OperationType,
        on_delete=models.DO_NOTHING,
        related_name="facility_types",
        db_comment="The type of operation that this facility type is associated with",
    )
    history = HistoricalRecords(
        table_name='erc_history"."facility_type_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Facility types"
        db_table = 'erc"."facility_type'

    def __str__(self) -> str:
        return f"{self.name} - {self.operation_type.name}"
