from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_verification import ReportVerification


class ReportVerificationVisit(TimeStampedModel):
    """
    Model to store information about a verification visit for a report verification.
    """

    report_verification = models.ForeignKey(
        ReportVerification,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The report verification associated with this visit",
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
        db_table = 'erc"."verification_visit'
        db_table_comment = "Table to store individual verification visit information"
        app_label = 'reporting'
