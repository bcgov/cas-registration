import pgtrigger
from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from compliance.models.compliance_report_version import ComplianceReportVersion
from .rls_configs.compliance_earned_credit import Rls as ComplianceEarnedCreditRls
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
        CHANGES_REQUIRED = 'Changes Required'

    compliance_report_version = models.OneToOneField(
        ComplianceReportVersion,
        on_delete=models.CASCADE,
        related_name="compliance_earned_credit",
        db_comment="The compliance report version this earned_credit record belongs to",
    )

    earned_credits_amount = models.PositiveIntegerField(
        db_comment="The amount of earned credits. Whole numbers only.",
    )

    issuance_status = models.CharField(
        max_length=100,
        choices=IssuanceStatus.choices,
        default=IssuanceStatus.CREDITS_NOT_ISSUED,
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
        related_name="compliance_earned_credits_issued_by",
        db_comment="The user who issued the earned credits",
    )

    bccr_trading_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_comment="The BCCR trading name. This is the name of the account holder in the BC Carbon Registry",
    )

    analyst_comment = models.TextField(
        blank=True,
        null=True,
        db_comment="Comments from an analyst. Made when deciding whether or not to recommend issuance from the director",
    )

    director_comment = models.TextField(
        blank=True,
        null=True,
        db_comment="Comments from the director. Made when deciding whether or not to issue the credits",
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_earned_credit_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "A table to store BC earned credit compliance data. Earned credits are described in GGIRCA (https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01#division_d0e1496) Division 4"
        db_table = 'erc"."compliance_earned_credit'
        triggers = [
            *TimeStampedModel.Meta.triggers,
            pgtrigger.Trigger(
                name="restrict_bccr_trading_name_unless_not_issued",
                when=pgtrigger.Before,
                operation=pgtrigger.Insert | pgtrigger.Update,
                condition=pgtrigger.Q(new__bccr_trading_name__isnull=True) | pgtrigger.Q(new__bccr_trading_name=""),
                func="""
                    if new.issuance_status != 'Credits Not Issued in BCCR' then
                        raise exception 'bccr_trading_name cannot be empty unless issuance_status is "Credits Not Issued in BCCR"';
                    end if;
                    return new;
                """,
            ),
        ]

    Rls = ComplianceEarnedCreditRls
