from django.db import models
from django.db.models import Q
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_verification import ReportVerification


class ReportVerificationVisit(TimeStampedModel):
    """
    Model to store information about a verification visit for a report verification.
    """

    report_verification = models.ForeignKey(
        ReportVerification,
        on_delete=models.CASCADE,
        related_name="report_verification_visits",
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

    visit_coordinates = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_comment="Geographic location of an other facility visited",
    )

    is_other_visit = models.BooleanField(
        db_comment="Flag to indicate the visit is an other facility visited",
        default=False,
    )

    class Meta:
        db_table = 'erc"."verification_visit'
        db_table_comment = "Table to store individual verification visit information"
        app_label = 'reporting'
        constraints = [
            models.CheckConstraint(
                name="other_facility_must_have_coordinates",
                check=~Q(is_other_visit=True) | Q(visit_coordinates__isnull=False),
                violation_error_message="Coordinates must be provided for an other facility visit",
            ),
        ]
