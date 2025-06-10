from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import ElicensingClientOperator
from .rls_configs.elicensing_invoice import Rls as ElicensingInvoiceRls


class ElicensingInvoice(TimeStampedModel):
    """
    Invoice data synced with elicensing.

    """

    invoice_number = models.CharField(db_comment="The invoice number from elicensing.")

    elicensing_client_operator = models.ForeignKey(
        ElicensingClientOperator,
        on_delete=models.CASCADE,
        db_comment="Foreign key to the elicensing_client_operator record for the client who this invoice is for",
        related_name="elicensing_invoices",
    )

    due_date = models.DateTimeField(db_comment="The due date of the invoice. invoicePaymentDueDate in elicensing")

    outstanding_balance = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The outstanding balance for this invoice. invoiceOutstandingBalance in elicensing",
    )

    invoice_fee_balance = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        null=True,
        db_comment="The balance of fees for this invoice. invoiceFeeBalance in elicensing",
    )

    invoice_interest_balance = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        null=True,
        db_comment="The balance of interest for this invoice. invoiceInterestBalance in elicensing",
    )

    is_void = models.BooleanField(
        default=False, db_comment="Boolean field indicates whether this invoice has been voided"
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "Table contains invoice data from elicensing"
        db_table = 'erc"."elicensing_invoice'

    Rls = ElicensingInvoiceRls
