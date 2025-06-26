from common.tests.utils.helpers import BaseTestCase
from django.utils import timezone
from registration.models import (
    Address,
    BusinessStructure,
    User,
    Operator,
    UserOperator,
)
from django.core.exceptions import ValidationError
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    OPERATOR_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
)


class OperatorModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, OPERATOR_FIXTURE, USER_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = Operator.objects.first()
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
            ("status", "status", 1000, None),
            ("operations", "operation", None, None),
            ("user_operators", "user operator", None, 2),
            ("operation_designated_operators", "operation designated operator timeline", None, None),
            ("report", "report", None, None),
            ("contacts", "contact", None, None),
            ("parent_operators", "parent operator", None, None),
            ("partner_operators", "partner operator", None, None),
            ("transfer_events_from", "transfer event", None, None),
            ("transfer_events_to", "transfer event", None, None),
        ]

    def test_check_cra_business_number_format(self):
        valid_numbers = ['123454321', 123454321]
        for number in valid_numbers:
            self.test_object.cra_business_number = number
            self.test_object.save()
            assert isinstance(self.test_object.cra_business_number, str)

        invalid_numbers = [1234543210, 12345432, '1234567890', '12345678', 'ABCDEFGHI', '123-ABCde', '^&*%#@!()']
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
