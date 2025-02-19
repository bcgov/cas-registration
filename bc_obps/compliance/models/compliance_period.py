from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords


class CompliancePeriod(TimeStampedModel):
    """Model to store compliance periods"""

    start_date = models.DateField(db_comment="The start date of the compliance period")
    end_date = models.DateField(db_comment="The end date of the compliance period")
    compliance_deadline = models.DateField(db_comment="The deadline date for compliance submissions")

    history = HistoricalRecords(
        table_name='erc_history"."compliance_period_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store compliance periods"
        db_table = 'erc"."compliance_period'
