from common.models import EmailNotificationTemplate
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
