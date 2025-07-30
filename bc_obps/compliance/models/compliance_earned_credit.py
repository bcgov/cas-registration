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
        CREDITS_NOT_ISSUED = ('Credits Not Issued in BCCR',)
        ISSUANCE_REQUESTED = ('Issuance Requested',)
        CHANGES_REQUIRED = ('Changes Required',)
        APPROVED = ('Approved',)
        DECLINED = ('Declined',)

    class AnalystSuggestion(models.TextChoices):
        READY_TO_APPROVE = ('Ready to approve',)
        REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID = ('Requiring change of BCCR Holding Account ID',)
        REQUIRING_SUPPLEMENTARY_REPORT = ('Requiring supplementary report',)

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

    analyst_submitted_date = models.DateField(
        blank=True,
        null=True,
        db_comment="The date on which the analyst provided the suggestion",
    )
    analyst_submitted_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="compliance_earned_credits_analyst_submitted_by",
        db_comment="The analyst who provided the suggestion",
    )

    bccr_holding_account_id = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        db_comment="The BCCR holding account ID. This is the ID of the account holder in the BC Carbon Registry",
    )

    bccr_trading_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_comment="The BCCR trading name. This is the name of the account holder in the BC Carbon Registry",
    )

    bccr_project_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_comment="The BCCR project ID associated with this earned credit, for idempotency.",
    )
    bccr_issuance_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_comment="The BCCR issuance ID associated with this earned credit, for idempotency.",
    )

    analyst_suggestion = models.CharField(
        max_length=100,
        choices=AnalystSuggestion.choices,
        blank=True,
        null=True,
        db_comment="The suggestion from the analyst on whether or not to recommend issuance of the credits",
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

    issuance_requested_date = models.DateField(
        blank=True,
        null=True,
        db_comment="The date on which the earned credits were requested to be issued by the industry user",
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
                name="restrict_bccr_fields_unless_not_issued",
                when=pgtrigger.Before,
                operation=pgtrigger.Insert | pgtrigger.Update,
                condition=(pgtrigger.Q(new__bccr_trading_name__isnull=True) | pgtrigger.Q(new__bccr_trading_name=""))
                | (
                    pgtrigger.Q(new__bccr_holding_account_id__isnull=True)
                    | pgtrigger.Q(new__bccr_holding_account_id="")
                ),
                func="""
                    if new.issuance_status != 'Credits Not Issued in BCCR' then
                        if (new.bccr_trading_name is null or new.bccr_trading_name = '') then
                            raise exception 'bccr_trading_name cannot be empty unless issuance_status is "Credits Not Issued in BCCR"';
                        end if;
                        if (new.bccr_holding_account_id is null or new.bccr_holding_account_id = '') then
                            raise exception 'bccr_holding_account_id cannot be empty unless issuance_status is "Credits Not Issued in BCCR"';
                        end if;
                    end if;
                    return new;
                """,
            ),
            pgtrigger.Trigger(
                name="populate_analyst_submission_info",
                when=pgtrigger.Before,
                operation=pgtrigger.Update,
                func="""
                    -- Populate submission info whenever the analyst comment changes
                    if old.analyst_comment is distinct from new.analyst_comment then
                        new.analyst_submitted_date = current_date;
                        new.analyst_submitted_by_id = (select nullif(current_setting('my.guid', true), ''));
                    end if;
                    return new;
                """,
            ),
            pgtrigger.Trigger(
                name="populate_issued_date_issued_by_on_decision",
                when=pgtrigger.Before,
                operation=pgtrigger.Update,
                condition=pgtrigger.Q(new__issuance_status="Approved"),
                func="""
                    new.issued_date = current_date;
                    new.issued_by_id = (select nullif(current_setting('my.guid', true), ''));
                    return new;
                """,
            ),
            pgtrigger.Trigger(
                name="populate_issuance_requested_date_when_requested",
                when=pgtrigger.Before,
                operation=pgtrigger.Update,
                condition=pgtrigger.Q(new__issuance_status="Issuance Requested"),
                func="""
                    new.issuance_requested_date = current_date;
                    return new;
                """,
            ),
        ]

    Rls = ComplianceEarnedCreditRls
