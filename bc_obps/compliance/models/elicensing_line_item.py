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

    object_id = models.IntegerField(primary_key=True, db_comment="The objectId of the line item from elicensing")

    guid = models.CharField(db_comment="The guid of the line item from elicensing")

    elicensing_invoice = models.ForeignKey(
        ElicensingInvoice,
        on_delete=models.CASCADE,
        db_comment="Foreign key to the OBPS elicensing_invoice table.",
    )

    line_item_type = models.CharField(
        choices=LineItemType.choices, default=LineItemType.FEE, db_comment="The type of line item from elicensing."
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "Table contains line item data on an invoice from elicensing"
        db_table = 'erc"."elicensing_line_item'

    Rls = ElicensingLineItemRls
