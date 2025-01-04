from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion


class ReportVerification(TimeStampedModel):
    """
    Model to store verification information for a report version.
    """

    report_version = models.OneToOneField(
        ReportVersion,
        on_delete=models.PROTECT,
        related_name="report_verification",
        db_comment="The report version of this report verification",
        primary_key=True,
    )

    verification_body_name = models.CharField(
        max_length=1000, db_comment="The name of the verification body conducting the verification"
    )

    class AccreditedBy(models.TextChoices):
        ANAB = "ANAB"
        SCC = "SCC"

    accredited_by = models.CharField(
        max_length=10, choices=AccreditedBy.choices, db_comment="The verification accreditation body"
    )

    class ScopeOfVerification(models.TextChoices):
        BC_OBPS = "B.C. OBPS Annual Report"
        SUPPLEMENTARY = "Supplementary Report"
        CORRECTED = "Corrected Report"

    scope_of_verification = models.CharField(
        max_length=50, choices=ScopeOfVerification.choices, db_comment="The scope of the verification"
    )

    threats_to_independence = models.BooleanField(
        db_comment="Indicates whether there were any threats to independence noted",
    )

    class VerificationConclusion(models.TextChoices):
        POSITIVE = "Positive"
        MODIFIED = "Modified"
        NEGATIVE = "Negative"

    verification_conclusion = models.CharField(
        max_length=8,
        choices=VerificationConclusion.choices,
        db_comment="The conclusion of the verification",
    )

    visit_name = models.CharField(
        max_length=100, db_comment="The name of the site visited (Facility X, Other, or None)"
    )

    class VisitType(models.TextChoices):
        IN_PERSON = "In person"
        VIRTUAL = "Virtual"

    visit_type = models.CharField(
        max_length=10,
        choices=VisitType.choices,
        null=True,
        blank=True,
        db_comment="The type of visit conducted (Virtual or In Person)",
    )

    other_facility_name = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_comment="Name of the other facility visited if 'Other' is selected",
    )

    other_facility_coordinates = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_comment="Geographic location of the other facility visited",
    )

    class Meta:
        db_table = 'erc"."report_verification'
        db_table_comment = "Table to store verification information associated with a report version"
        app_label = 'reporting'
