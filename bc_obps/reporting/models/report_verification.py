from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_verification import Rls as ReportVerificationRls


class ReportVerification(TimeStampedModel):
    """
    Model to store verification information for a report version.
    """

    report_version = models.OneToOneField(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_verification",
        db_comment="The report version of this report verification",
    )

    verification_body_name = models.CharField(
        max_length=1000,
        db_comment="The name of the verification body conducting the verification",
    )

    class AccreditedBy(models.TextChoices):
        ANAB = "ANAB"
        SCC = "SCC"

    accredited_by = models.CharField(
        max_length=10,
        choices=AccreditedBy.choices,
        db_comment="The verification accreditation body",
    )

    class ScopeOfVerification(models.TextChoices):
        BC_OBPS = "B.C. OBPS Annual Report"
        SUPPLEMENTARY = "Supplementary Report"
        CORRECTED = "Corrected Report"

    # TEMPORARY: Made optional to support #607
    scope_of_verification = models.CharField(
        max_length=50,
        db_comment="The scope of the verification",
        # choices=ScopeOfVerification.choices,
        null=True,  # Allows NULL values temporarily
        blank=True,  # Allows empty values temporarily
    )

    threats_to_independence = models.BooleanField(
        db_comment="Indicates whether there were any threats to independence noted",
    )

    class VerificationConclusion(models.TextChoices):
        POSITIVE = "Positive"
        MODIFIED = "Modified"
        NEGATIVE = "Negative"

    # TEMPORARY: Made optional to support #607
    verification_conclusion = models.CharField(
        max_length=8,
        db_comment="The conclusion of the verification",
        # choices=VerificationConclusion.choices,
        null=True,  # Allows NULL values temporarily
        blank=True,  # Allows empty values temporarily
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_verification'
        db_table_comment = "Table to store verification information associated with a report version"
        app_label = "reporting"
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportVerificationRls
