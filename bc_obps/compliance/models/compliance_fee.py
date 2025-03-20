from django.db import models
from decimal import Decimal
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from django.utils import timezone
from .compliance_obligation import ComplianceObligation
from .rls_configs.compliance_fee import Rls as ComplianceFeeRls


class ComplianceFee(TimeStampedModel):
    """
    Model to store fees associated with compliance obligations for excess emissions.
    
    These fees are created when a compliance obligation is established and
    represent the monetary value owed to the government for excess emissions.
    Fees are synced with the eLicensing system.
    """

    class FeeStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SYNCED = "SYNCED", "Synced with eLicensing"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    # Fee calculation constants
    # From https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015
    EXCESS_EMISSIONS_FEE_RATE = Decimal('25.00')  # $25 per tCO2e - specific fee rate

    compliance_obligation = models.OneToOneField(
        ComplianceObligation,
        on_delete=models.PROTECT,
        related_name="fee",
        db_comment="The compliance obligation this fee is associated with",
    )
    
    fee_amount = models.DecimalField(
        max_digits=20, decimal_places=2, 
        db_comment="The fee amount in CAD dollars"
    )
    
    status = models.CharField(
        max_length=20,
        choices=FeeStatus.choices,
        default=FeeStatus.PENDING,
        db_comment="The status of the fee (e.g., PENDING, SYNCED, PAID, CANCELLED)",
    )
    
    fee_date = models.DateField(
        default=timezone.now,
        db_comment="The date when the fee was created, used for eLicensing integration",
    )
    
    fee_description = models.CharField(
        max_length=60,
        db_comment="Description of the fee for eLicensing integration",
    )
    
    fee_profile_group_name = models.CharField(
        max_length=30,
        default="EXCESS_EMISSIONS",
        db_comment="The fee profile group name for eLicensing integration",
    )
    
    business_area_code = models.CharField(
        max_length=6,
        default="OBPS",
        db_comment="The business area code for eLicensing integration",
    )
    
    elicensing_fee_object_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        db_comment="The fee object ID in the eLicensing system, populated after sync",
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_fee_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store fees associated with compliance obligations"
        db_table = 'erc"."compliance_fee'

    Rls = ComplianceFeeRls 