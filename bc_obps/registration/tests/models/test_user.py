from common.tests.utils.helpers import BaseTestCase
from registration.models import (
    Document,
    User,
    AppRole,
)
from django.core.exceptions import ValidationError
from registration.tests.constants import DOCUMENT_FIXTURE, USER_FIXTURE


class UserModelTest(BaseTestCase):
    fixtures = [USER_FIXTURE, DOCUMENT_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        cls.test_object.documents.set([Document.objects.get(id=1), Document.objects.get(id=2)])
        cls.field_data = [
            ("first_name", "first name", 1000, None),
            ("last_name", "last name", 1000, None),
            ("position_title", "position title", 1000, None),
            ("email", "email", 254, None),
            (
                "phone_number",
                "phone number",
                None,
                None,
            ),  # Replace None with the actual max length if available
            ("user_guid", "user guid", None, None),
            ("business_guid", "business guid", None, None),
            ("bceid_business_name", "bceid business name", None, None),
            ("documents", "documents", None, 2),
            ("app_role", "app role", None, None),
            ("operators_verified_by", "operator", None, None),
            ("user_operators", "user operator", None, None),
            ("user_operators_verified_by", "user operator", None, None),
            ("operation_verified_by", "operation", None, None),
            # related models by TimestampedModel
            ("document_created", "document", None, None),
            ("document_updated", "document", None, None),
            ("document_archived", "document", None, None),
            ("contact_created", "contact", None, None),
            ("contact_updated", "contact", None, None),
            ("contact_archived", "contact", None, None),
            ("operator_created", "operator", None, None),
            ("operator_updated", "operator", None, None),
            ("operator_archived", "operator", None, None),
            ("useroperator_created", "user operator", None, None),
            ("useroperator_updated", "user operator", None, None),
            ("useroperator_archived", "user operator", None, None),
            ("operation_created", "operation", None, None),
            ("operation_updated", "operation", None, None),
            ("operation_archived", "operation", None, None),
            ("multipleoperator_created", "multiple operator", None, None),
            ("multipleoperator_updated", "multiple operator", None, None),
            ("multipleoperator_archived", "multiple operator", None, None),
            ("parentoperator_created", "parent operator", None, None),
            ("parentoperator_updated", "parent operator", None, None),
            ("parentoperator_archived", "parent operator", None, None),
            ("facility_created", "facility", None, None),
            ("facility_updated", "facility", None, None),
            ("facility_archived", "facility", None, None),
            ("wellauthorizationnumber_created", "well authorization number", None, None),
            ("wellauthorizationnumber_updated", "well authorization number", None, None),
            ("wellauthorizationnumber_archived", "well authorization number", None, None),
            ("facilityownershiptimeline_created", "facility ownership timeline", None, None),
            ("facilityownershiptimeline_updated", "facility ownership timeline", None, None),
            ("facilityownershiptimeline_archived", "facility ownership timeline", None, None),
            ("operationownershiptimeline_created", "operation ownership timeline", None, None),
            ("operationownershiptimeline_updated", "operation ownership timeline", None, None),
            ("operationownershiptimeline_archived", "operation ownership timeline", None, None),
            ("event_created", "event", None, None),
            ("event_updated", "event", None, None),
            ("event_archived", "event", None, None),
        ]

    def test_unique_user_guid_and_business_guid_constraint(self):
        # First user is `cls.test_object` from the fixture, attempt to create another user with the same user_guid and business_guid
        user2 = User(
            first_name="fname-test2",
            last_name="lname-test2",
            position_title="Manager",
            email="alicesmith@example.com",
            phone_number="+16044011234",
            user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6",
            business_guid="11111111-1111-1111-1111-111111111111",
            app_role=AppRole.objects.get(role_name="cas_admin"),
        )

        with self.assertRaises(ValidationError, msg="User with this User guid already exists."):
            user2.save()

    def test_business_guid_not_null_constraint(self):
        # First user is `cls.test_object` from the fixture, attempt to create another user with the same user_guid and business_guid
        user2 = User(
            first_name="fname-test2",
            last_name="lname-test2",
            position_title="Manager",
            email="alicesmith@example.com",
            phone_number="+16044011234",
            user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6",
            business_guid=None,
        )

        with self.assertRaises(ValidationError, msg="This field cannot be null."):
            user2.save()

    def test_bceid_business_name_not_null_constraint(self):
        # First user is `cls.test_object` from the fixture, attempt to create another user with the same user_guid and business_guid
        user2 = User(
            first_name="fname-test2",
            last_name="lname-test2",
            position_title="Manager",
            email="alicesmith@example.com",
            phone_number="+16044011234",
            user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6",
            business_guid="11111111-1111-1111-1111-111111111111",
            bceid_business_name=None,
        )

        with self.assertRaises(ValidationError, msg="This field cannot be blank."):
            user2.save()

    def test_get_user_full_name(self):
        user = User.objects.first()
        self.assertEqual(user.get_full_name(), f"{user.first_name} {user.last_name}")
