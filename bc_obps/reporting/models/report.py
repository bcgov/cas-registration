from common.models import BaseModel
from django.db import models
from registration.models.operation import Operation


class Report(BaseModel):
    """
    Report model for storing OBPS reports
    """

    title = models.CharField(max_length=100, db_comment="The title of the report")
    description = models.TextField(db_comment="The description of the report")
    created_at = models.DateTimeField(auto_now_add=True, db_comment="The timestamp when the report was created")

    # This will need to be updated
    operation = models.ForeignKey(
        Operation, on_delete=models.DO_NOTHING, db_comment="The operation to which this report belongs", null=True
    )

    reporting_year = models.IntegerField(default=2024, db_comment="The reporting year for which this report was filed")

    class Meta:
        db_table_comment = "A table to store reports"
        db_table = 'erc"."report'
        app_label = 'reporting'

    def __str__(self) -> str:
        return self.title
