from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import ElicensingInvoice
from .rls_configs.elicensing_line_item import Rls as ElicensingLineItemRls


class ElicensingLineItem(TimeStampedModel):
    """
    Line item data synced with elicensing. Currently a line item = Fee in elicensing, however this model could be expanded to other
    line items by adding more to the 'type' class

    """

    class LineItemType(models.TextChoices):
        FEE = ('Fee',)

    object_id = models.IntegerField(db_comment="The objectId of the line item from elicensing")

    guid = models.UUIDField(db_comment="The guid of the line item from elicensing")

    elicensing_invoice = models.ForeignKey(
        ElicensingInvoice,
        on_delete=models.CASCADE,
        db_comment="Foreign key to the OBPS elicensing_invoice table.",
        related_name="elicensing_line_items",
    )

    fee_date = models.DateTimeField(db_comment="The date of the fee. feeDueDate in elicensing")

    description = models.CharField(db_comment="Description of the line item (fee).", blank=True, null=True)

    base_amount = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The amount of this line item. baseAmount in elicensing",
    )

    line_item_type = models.CharField(
        choices=LineItemType.choices, default=LineItemType.FEE, db_comment="The type of line item from elicensing."
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "Table contains line item data on an invoice from elicensing"
        db_table = 'erc"."elicensing_line_item'

    Rls = ElicensingLineItemRls
