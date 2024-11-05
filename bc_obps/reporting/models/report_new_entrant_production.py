from django.db import models
from registration.models import RegulatedProduct
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_new_entrant import ReportNewEntrant


class ReportNewEntrantProduction(TimeStampedModel):
    product = models.ForeignKey(
        RegulatedProduct,
        on_delete=models.CASCADE,
        related_name="new_entrant_productions",
        db_comment="The regulated product associated with this production record",
    )
    report_new_entrant = models.ForeignKey(
        ReportNewEntrant,
        on_delete=models.CASCADE,
        related_name="productions",
        db_comment="The new entrant report to which this production record belongs",
    )
    production_amount = models.IntegerField(
        blank=True,
        null=True,
        default=0,
        db_comment="The amount of production associated with this report",
    )

    class Meta:
        db_table = 'erc"."report_new_entrant_production'
        app_label = 'reporting'
        db_table_comment = "Table for storing production data related to new entrant emissions reporting"
