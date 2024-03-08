from django.db import models

class Report(models.Model):
    title = models.CharField(max_length=100, db_comment="The title of the report")
    description = models.TextField(db_comment="The description of the report")
    created_at = models.DateTimeField(auto_now_add=True, db_comment="The timestamp when the report was created")

    class Meta:
        db_table_comment = "A table to store reports"
        db_table = 'erc"."report'
        app_label = 'reporting'

    def __str__(self):
        return self.title
