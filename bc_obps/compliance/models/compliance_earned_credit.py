from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from compliance.models.compliance_report_version import ComplianceReportVersion
from .rls_configs.compliance_obligation import Rls as ComplianceEarnedCreditRls
from registration.models.user import User


class ComplianceEarnedCredit(TimeStampedModel):
    """
    Model to store compliance earned credits records

    If the director is satisfied that the greenhouse gas emissions of the regulated operation for the compliance period were less than
    the emission limit applicable to that regulated operation for that compliance period, the director may issue, by crediting to a
    holding account of the operator of the regulated operation, one credit for each tonne of carbon dioxide equivalent emissions
    by which the greenhouse gas emissions of that regulated operation were less than that emission limit.
    """

    class IssuanceStatus(models.TextChoices):
        ISSUANCE_REQUESTED = ('Issuance Requested',)
        AWAITING_APPROVAL = ('Awaiting Approval',)
        APPROVED = ('Approved',)
        CREDITS_ISSUED = ('Credits Issued in BCCR',)
        DECLINED = ('Declined',)
        CREDITS_NOT_ISSUED = ('Credits Not Issued in BCCR',)
        CHANGES_REQUESTED = 'Changes Required'

    compliance_report_version = models.ForeignKey(
        ComplianceReportVersion,
        on_delete=models.CASCADE,
        related_name="compliance_earned_credits",
        db_comment="The compliance report version this earned_credit record belongs to",
    )

    earned_credits_amount = models.IntegerField(
        db_comment="The amount of earned credits. Whole numbers only.",
    )

    issuance_status = models.CharField(
        max_length=100,
        choices=IssuanceStatus.choices,
        db_comment="The status of this of the earned credits in this record.",
    )

    issued_date = models.DateField(
        blank=True,
        null=True,
        db_comment="The date on which the earned credits were issued",
    )

    issued_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        blank=True,
        null=True,
        related_name="compliance_earned_credits",
        db_comment="The user who issed the earned credits",
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_earned_credit_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "A table to store BC earned credit compliance data. Earned credits are described in GGIRCA (https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01#division_d0e1496) Division 4"
        db_table = 'erc"."compliance_earned_credit'

    Rls = ComplianceEarnedCreditRls
