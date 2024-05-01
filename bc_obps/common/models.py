from django.db import models
from django.contrib.postgres.fields import ArrayField


class EmailNotificationTemplate(models.Model):
    """
    Responsible for storing email templates for notifications
    """

    name = models.CharField(max_length=255, unique=True, db_comment="Name of the email template as a unique identifier")
    subject = models.CharField(max_length=255, db_comment="Subject of the email template")
    body = models.TextField(db_comment="Body of the email template")

    class Meta:
        db_table_comment = "Stores email templates for notifications"
        db_table = 'common"."email_notification_template'


class EmailNotification(models.Model):
    """
    Responsible for storing email notifications after they have been sent
    We store the transaction_id and message_id for tracking purposes
    """

    transaction_id = models.UUIDField(
        primary_key=True, editable=False, db_comment="Transaction identifier for the email message in CHES API"
    )
    message_id = models.UUIDField(editable=False, db_comment="Message identifier for the email message in CHES API")
    recipients_email = ArrayField(
        models.EmailField(max_length=255), db_comment="List of email addresses to send the email to"
    )
    template = models.ForeignKey(
        EmailNotificationTemplate,
        on_delete=models.DO_NOTHING,
        related_name='email_notifications',
        db_comment="Email template to use for the email notification",
    )

    class Meta:
        db_table_comment = "Stores email notifications after they have been sent"
        db_table = 'common"."email_notification'
