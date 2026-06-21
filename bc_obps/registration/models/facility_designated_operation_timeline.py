from django.db import models
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import Facility, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.facility_designated_operation_timeline import Rls as FacilityDesignatedOperationRls


class FacilityDesignatedOperationTimeline(TimeStampedModel):
    facility = models.ForeignKey(
        Facility,
        on_delete=models.PROTECT,
        related_name="designated_operations",
        db_comment="The facility whose operation ownership history is being tracked. Foreign key to erc.facility",
    )
    operation = models.ForeignKey(
        Operation,
        on_delete=models.PROTECT,
        related_name="facility_designated_operations",
        db_comment="The operation designated as responsible for this facility during the recorded period. Foreign key to erc.operation",
    )
    start_date = models.DateTimeField(
        blank=True,
        null=True,
        db_comment="The date an operation became the designated operation of a facility. This data captures the relationship between the facility and operation it falls under.",
    )
    end_date = models.DateTimeField(
        blank=True,
        null=True,
        db_comment="The date an operation stopped being the designated operation of a facility. Null indicates this is the currently active relationship",
    )

    history = HistoricalRecords(
        table_name='erc_history"."facility_designated_operation_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Tracks the history of which operation has been designated as responsible for a given facility over time. A new record is created whenever a facility changes operation ownership. A null end_date indicates the currently active relationship. Used to support facility transfers between operators."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.FACILITY_DESIGNATED_OPERATION_TIMELINE.value}'

        constraints = [
            models.UniqueConstraint(
                fields=['facility'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_designated_operation_per_facility',
            )
        ]

    Rls = FacilityDesignatedOperationRls
