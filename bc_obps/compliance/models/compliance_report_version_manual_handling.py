import pgtrigger
from django.db import models

from registration.models.time_stamped_model import TimeStampedModel
from registration.models.user import User
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.models.rls_configs.compliance_report_version_manual_handling import (
    Rls as ComplianceReportVersionManualHandlingRls,
)


class ComplianceReportVersionManualHandling(TimeStampedModel):
    """Tracks manual handling resolution for a compliance report version."""

    class HandlingType(models.TextChoices):
        OBLIGATION = "obligation", "Obligation"
        EARNED_CREDITS = "earned_credits", "Earned Credits"

    class DirectorDecision(models.TextChoices):
        PENDING_MANUAL_HANDLING = "pending_manual_handling", "Pending manual handling"
        ISSUE_RESOLVED = "issue_resolved", "Issue has been resolved"

    class Context(models.TextChoices):
        OBLIGATION_REFUND_POOL_CASH = (
            "obligation_refund_pool_cash",
            "Obligation is fully paid and the refund pool contains refundable cash.",
        )
        EARNED_CREDITS_PREVIOUSLY_APPROVED = (
            "earned_credits_previously_approved",
            "Earned credits have been previously approved.",
        )

    compliance_report_version = models.OneToOneField(
        ComplianceReportVersion,
        on_delete=models.CASCADE,
        related_name="manual_handling_record",
        db_comment="The CRV that requires manual handling.",
    )

    handling_type = models.CharField(
        max_length=50,
        choices=HandlingType.choices,
        db_comment="The type of manual handling.",
    )

    context = models.CharField(
        max_length=100,
        choices=Context.choices,
        db_comment="Reason for requiring manual handling.",
    )

    analyst_comment = models.TextField(
        blank=True,
        null=True,
        db_comment="Optional comment entered by the analyst.",
    )

    analyst_submitted_date = models.DateField(
        blank=True,
        null=True,
        db_comment="The date on which the analyst provided or updated the manual handling comment.",
    )

    analyst_submitted_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="compliance_manual_handling_analyst_submitted_by",
        db_comment="The analyst who provided the manual handling comment.",
    )

    director_decision = models.CharField(
        max_length=50,
        choices=DirectorDecision.choices,
        default=DirectorDecision.PENDING_MANUAL_HANDLING,
        db_comment="Director's decision about the manual handling case.",
    )

    director_decision_date = models.DateField(
        blank=True,
        null=True,
        db_comment="The date on which the director made the decision.",
    )

    director_decision_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="compliance_manual_handling_director_decision_by",
        db_comment="The director who made the decision.",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table = 'erc"."compliance_report_version_manual_handling'
        db_table_comment = "Tracks analyst and director manual handling resolution for compliance report versions"
        triggers = [
            *TimeStampedModel.Meta.triggers,
            # Auto-populate analyst_submitted_date / analyst_submitted_by when analyst_comment changes
            pgtrigger.Trigger(
                name="mh_analyst_submit_info",  # short name (< 47 chars)
                when=pgtrigger.Before,
                operation=pgtrigger.Update,
                func="""
                    -- Populate submission info whenever the analyst comment changes
                    IF old.analyst_comment IS DISTINCT FROM new.analyst_comment THEN
                        new.analyst_submitted_date = current_date;
                        new.analyst_submitted_by_id =
                            (SELECT nullif(current_setting('my.guid', true), ''));
                    END IF;
                    RETURN NEW;
                """,
            ),
            # Auto-populate director_decision_date / director_decision_by when issue is resolved
            pgtrigger.Trigger(
                name="mh_director_decision_info",  # short name (< 47 chars)
                when=pgtrigger.Before,
                operation=pgtrigger.Update,
                condition=pgtrigger.Q(new__director_decision="issue_resolved"),
                func="""
                    -- When director marks the issue as resolved, stamp who/when
                    IF old.director_decision IS DISTINCT FROM new.director_decision
                       AND new.director_decision = 'issue_resolved' THEN
                        new.director_decision_date = current_date;
                        new.director_decision_by_id =
                            (SELECT nullif(current_setting('my.guid', true), ''));
                    END IF;
                    RETURN NEW;
                """,
            ),
        ]

    Rls = ComplianceReportVersionManualHandlingRls
