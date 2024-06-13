from django.db import models
from django.contrib.postgres.fields import ArrayField
from common.models.email_notification_template import EmailNotificationTemplate


class EmailNotification(models.Model):
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
