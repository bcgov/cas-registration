from django.db import models


class DashboardData(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        db_comment="Name of the dashboard by app and ID type used as a friendly unique identifier.",
    )
    data = models.JSONField(db_comment="JSON representation of dashboard navigation tiles.")

    def __str__(self) -> str:  # Add type annotation for the return value (str)
        return f"DashboardData {self.id} - {self.name}"  # Informative string representation

    class Meta:
        db_table_comment = "The JSON information for dashboard navigation tiles by app and ID type."
        db_table = 'common"."dashboard_data'
