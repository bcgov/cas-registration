from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import ElicensingLineItem
from .rls_configs.elicensing_payment import Rls as ElicensingPaymentRls


class ElicensingPayment(TimeStampedModel):
    """
    Payment data synced with elicensing.

    """

    payment_object_id = models.IntegerField(db_comment="The object id of the payment in elicensing (paymentObjectId)")

    elicensing_line_item = models.ForeignKey(
        ElicensingLineItem,
        on_delete=models.CASCADE,
        db_comment="Foreign key to the line item record this payment relates to",
        related_name="elicensing_payments",
    )

    amount = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The amount of this payment in dollars from elicensing",
    )

    received_date = models.DateField(
        db_comment="receivedDate of the payment in elicensing. The date when payment is received in the OBPS bank account. Receive Date can be backdated. This is the date that impacts interest calculation.",
        null=True,
        blank=True,
    )

    method = models.CharField(
        db_comment="The method used to make the payment (e.g. wire transfer) from elicensing.", blank=True, null=True
    )

    receipt_number = models.CharField(db_comment="Receipt number of the payment in elicensing.", blank=True, null=True)

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "Table contains payment data from elicensing"
        db_table = 'erc"."elicensing_payment'

    Rls = ElicensingPaymentRls
