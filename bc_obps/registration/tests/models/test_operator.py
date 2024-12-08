from common.tests.utils.helpers import BaseTestCase
from django.utils import timezone
from registration.models import (
    Address,
    BusinessStructure,
    Document,
    User,
    Contact,
    Operator,
    UserOperator,
)
from django.core.exceptions import ValidationError
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    CONTACT_FIXTURE,
    OPERATOR_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
    DOCUMENT_FIXTURE,
)


class OperatorModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE, USER_FIXTURE, DOCUMENT_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = Operator.objects.first()
        cls.test_object.documents.set(
            [
                Document.objects.get(id=1),
                Document.objects.get(id=2),
            ]
        )

        cls.test_object.contacts.set([Contact.objects.get(id=1), Contact.objects.get(id=2)])
        # Create multiple UserOperators connected with the test Operator
        user_operators_user = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        user_operators_user_2 = User.objects.get(user_guid="4da70f32-65fd-4137-87c1-111f2daba3dd")

        UserOperator.objects.create(
            user=user_operators_user,
            operator=Operator.objects.first(),
            role=UserOperator.Roles.ADMIN,
            verified_at=timezone.now(),
            verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
        )

        UserOperator.objects.create(
            user=user_operators_user_2,
            operator=Operator.objects.first(),
            role=UserOperator.Roles.ADMIN,
            verified_at=timezone.now(),
            verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
        )

        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", None, None),
            (
                "bc_corporate_registry_number",
                "bc corporate registry number",
                None,
                None,
            ),
            ("swrs_organisation_id", "swrs organisation id", None, None),
            ("business_structure", "business structure", None, None),
            ("physical_address", "physical address", None, None),
            ("mailing_address", "mailing address", None, None),
            ("website", "website", 200, None),
            ("documents", "documents", None, 2),
            ("contacts", "contacts", None, 2),
            ("status", "status", 1000, None),
            ("verified_by", "verified by", None, None),
            ("verified_at", "verified at", None, None),
            ("is_new", "is new", None, None),
            ("operations", "operation", None, None),
            ("user_operators", "user operator", None, 2),
            ("operation_designated_operators", "operation designated operator timeline", None, None),
            ("report", "report", None, None),
            ("parent_operators", "parent operator", None, None),
            ("partner_operators", "partner operator", None, None),
            ("transfer_events_from", "transfer event", None, None),
            ("transfer_events_to", "transfer event", None, None),
        ]

    def test_check_cra_business_number_format(self):
        valid_numbers = [123454321]
        for number in valid_numbers:
            self.test_object.cra_business_number = number
            self.test_object.save()

        invalid_numbers = [123, '123456789', 'ABCDEFGHI', '123-ABCd', '^&*%#@!()']
        for number in invalid_numbers:
            self.test_object.cra_business_number = number
            with self.assertRaises(ValidationError):
                self.test_object.save()

    def test_unique_cra_business_number_constraint(self):
        # First operator is `cls.test_object` from the fixture, attempt to create another operator with matching cra_business_number
        invalid_operator = Operator(
            legal_name="test",
            trade_name="test",
            cra_business_number=self.test_object.cra_business_number,
            bc_corporate_registry_number='abc1234567',
            business_structure=BusinessStructure.objects.first(),
            physical_address=Address.objects.first(),
            mailing_address=Address.objects.first(),
        )

        with self.assertRaises(ValidationError, msg="Operator with this Cra business number already exists."):
            invalid_operator.save()
