from django.db import models


class EmailNotificationTemplate(models.Model):
    name = models.CharField(max_length=255, unique=True, db_comment="Name of the email template as a unique identifier")
    subject = models.CharField(max_length=255, db_comment="Subject of the email template")
    body = models.TextField(db_comment="Body of the email template")

    class Meta:
        db_table_comment = "Stores email templates for notifications"
        db_table = 'common"."email_notification_template'

    def __str__(self) -> str:
        return f"{self.id} - {self.name}"
