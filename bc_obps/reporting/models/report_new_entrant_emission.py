from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models import EmissionCategory
from reporting.models.report_new_entrant import ReportNewEntrant


class ReportNewEntrantEmission(TimeStampedModel):
    report_new_entrant = models.ForeignKey(
        ReportNewEntrant,
        on_delete=models.CASCADE,
        related_name="report_new_entrant_emission",
        db_comment="The new entrant report to which this production record belongs",
    )
    emission_category = models.ForeignKey(
        EmissionCategory,
        on_delete=models.PROTECT,
        related_name="report_new_entrant_emission",
        db_comment="The emission category",
    )

    emission = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="The amount of production associated with this report",
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_new_entrant_emission'
        app_label = 'reporting'
        db_table_comment = 'Table for storing emission data related to new entrant'
        constraints = [
            models.UniqueConstraint(
                fields=['report_new_entrant', 'emission_category'],
                name='unique_new_entrant_emissions',
                violation_error_code='A report new entrant emission already exists for this emission category',
            )
        ]
