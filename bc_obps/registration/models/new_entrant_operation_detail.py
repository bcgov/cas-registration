import uuid
from django.db import models
from registration.models import TimeStampedModel, Operation


class NewEntrantOperationDetail(TimeStampedModel):
    class DateOfFirstShipmentChoices(models.Choices):
        BEFORE_MARCH_31_2024 = "On or before March 31, 2024"
        AFTER_APRIL_1_2024 = "On or after April 1, 2024"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        db_comment="Primary key to identify the new entrant details for an operation",
        verbose_name="ID",
    )
    operation = models.OneToOneField(
        Operation, on_delete=models.PROTECT, db_comment="The operation associated with the New Entrant-specific details"
    )
    # NOTE: is it better to separate this statutory declaration from the ones
    # that were submitted in Reg1 (for all operations)?
    # application_and_statutory_declaration = models
    date_of_first_shipment = models.CharField(
        max_length=1000,
        choices=DateOfFirstShipmentChoices.choices,
        db_comment="The date of the operation's first shipment (determines which application and statutory declaration template should be used)",
    )
