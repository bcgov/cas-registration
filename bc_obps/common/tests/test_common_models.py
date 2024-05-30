from common.models import DashboardData, EmailNotification, EmailNotificationTemplate
from common.tests.utils.helpers import BaseTestCase

class DashboardDataModelTest(BaseTestCase):
    def setUp(self):
        """
        Set up initial data for the tests.
        """
        self.dashboard_data = DashboardData.objects.create(
            name="Test External Registration Operation Details",
            data={
                "dashboard": "registration-operation-detail",
                "access_roles": ["industry_user", "industry_user_admin"],
                "tiles": [
                    {
                        "title": "Operation Information",
                        "content": "View or update information of this operation here.",
                        "href": "/registration/tbd"
                    },
                    {
                        "title": "Facilities",
                        "content": "View the facilities, or to add new facility to this operation here.",
                        "href": "/registration/tbd"
                    }
                ]
            }
        )

    def test_dashboard_data_creation(self):
        """
        Test that a DashboardData instance is created correctly.
        """
        self.assertEqual(self.dashboard_data.name, "Test External Registration Operation Details")
        self.assertIsInstance(self.dashboard_data.data, dict)
        self.assertIn("dashboard", self.dashboard_data.data)
        self.assertIn("access_roles", self.dashboard_data.data)
        self.assertIn("tiles", self.dashboard_data.data)
        self.assertEqual(len(self.dashboard_data.data["tiles"]), 2)

    def test_string_representation(self):
        """
        Test the string representation of the DashboardData instance.
        """
        self.assertEqual(str(self.dashboard_data), f"DashboardData {self.dashboard_data.id} - Test External Registration Operation Details")

    def test_database_table_name(self):
        """
        Test the database table name.
        """
        self.assertEqual(DashboardData._meta.db_table, 'common"."dashboard_data')

    def test_database_table_comment(self):
        """
        Test the database table comment.
        """
        self.assertEqual(DashboardData._meta.db_table_comment, "The JSON information for dashboard navigation tiles by app and ID type.")

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
