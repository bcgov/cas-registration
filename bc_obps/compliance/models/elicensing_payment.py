from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import ElicensingClientOperator, ElicensingInvoice, ElicensingLineItem
from .rls_configs.elicensing_payment import Rls as ElicensingPaymentRls


class ElicensingPayment(TimeStampedModel):
    """
    Payment data synced with elicensing.

    """

    payment_object_id = models.IntegerField(
        primary_key=True, db_comment="The object id of the payment in elicensing (paymentObjectId)"
    )

    payment_guid = models.CharField(db_comment="The guid of the payment in elicensing")

    client_object_id = models.ForeignKey(
        ElicensingClientOperator,
        on_delete=models.CASCADE,
        db_column="client_object_id",
        db_comment="The clientObjectId identifier from elicensing for the related client",
    )

    invoice_number = models.ForeignKey(
        ElicensingInvoice,
        on_delete=models.CASCADE,
        db_column="invoice_number",
        db_comment="The invoice number from elicensing this payment relates to. Foreign key to the ElicensingInvoice model.",
    )

    line_item_object_id = models.ForeignKey(
        ElicensingLineItem,
        on_delete=models.CASCADE,
        db_column="line_item_object_id",
        db_comment="The line item from elicensing this payment relates to. Foreign key to the ElicensingLineItem model",
    )

    amount = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The amount of this payment in dollars from elicensing",
    )

    received_date = models.DateTimeField(db_comment="receivedDate of the payment in elicensing", null=True, blank=True)

    deposit_date = models.DateTimeField(db_comment="depositDate of the payment in elicensing", null=True, blank=True)

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "Table contains payment data from elicensing"
        db_table = 'erc"."elicensing_payment'

    Rls = ElicensingPaymentRls
