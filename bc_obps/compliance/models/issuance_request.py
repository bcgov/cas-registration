from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from .rls_configs.issuance_request import Rls as IssuanceRequestRls


class IssuanceRequest(TimeStampedModel):
    """Model to store issuance requests for compliance report versions"""

    class IssuanceStatus(models.TextChoices):
        AWAITING = "awaiting", "Awaiting approval"
        APPROVED = "approved", "Approved, credits issued in BCCR"

    status = models.CharField(
        max_length=20,
        choices=IssuanceStatus.choices,
        default=IssuanceStatus.AWAITING,
        db_comment="The status of the issuance request",
    )

    earned_credits = models.IntegerField(
        null=True,
        blank=True,
        db_comment="The number of earned credits",
    )

    bccr_trading_name = models.CharField(
        max_length=255,
        blank=True,
        db_comment="The BCCR trading name",
    )

    directors_comments = models.TextField(
        blank=True,
        db_comment="Comments from the director",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store issuance requests for compliance report versions"
        db_table = 'erc"."issuance_request'

    Rls = IssuanceRequestRls
