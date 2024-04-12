from common.models import EmailNotification, EmailNotificationTemplate
from common.tests.utils.helpers import BaseTestCase


class EmailNotificationTemplateModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = EmailNotificationTemplate.objects.first()
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 255, None),
            ("subject", "subject", 255, None),
            ("body", "body", None, None),
            ("email_notifications", "email notification", None, None),
        ]


class EmailNotificationModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = EmailNotification.objects.create(
            transaction_id="123e4567-e89b-12d3-a456-426614174000",
            message_id="123e4567-e89b-12d3-a456-426614174000",
            recipients_email=["baz@gov.bc.ca"],
            template=EmailNotificationTemplate.objects.first(),
        )
        cls.field_data = [
            ("transaction_id", "transaction id", None, None),
            ("message_id", "message id", None, None),
            ("recipients_email", "recipients email", None, None),
            ("template", "template", None, None),
        ]
