from common.tests.utils.helpers import BaseTestCase
from django.utils import timezone
from registration.models import (
    User,
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
)
from registration.tests.utils.bakers import user_operator_baker
from model_bakery import baker
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


class UserOperatorModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE, USER_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        user_operators_user = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        cls.test_object = UserOperator.objects.create(
            user=user_operators_user,
            operator=Operator.objects.first(),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
            verified_at=timezone.now(),
            verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("user_friendly_id", "user friendly id", None, None),
            ("user", "user", None, None),
            ("operator", "operator", None, None),
            ("role", "role", 1000, None),
            ("status", "status", 1000, None),
            ("verified_by", "verified by", None, None),
            ("verified_at", "verified at", None, None),
        ]

    def test_unique_user_operator_constraint(self):
        user_operators_user = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        # First user_operator record is `cls.test_object` from the fixture, attempt to create a row with duplicate a user/operator pair
        invalid_user_operator_record = UserOperator(
            user=user_operators_user,
            operator=Operator.objects.first(),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
            verified_at=timezone.now(),
            verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
        )

        with self.assertRaises(
            ValidationError, msg="A UserOperator record with this user-operator pair already exists."
        ):
            invalid_user_operator_record.save()

    def test_user_friendly_id_generation(self):
        user_operator_1 = user_operator_baker()
        user_operator_2 = user_operator_baker()
        user_operator_1_friendly_id = user_operator_1.user_friendly_id
        user_operator_2_friendly_id = user_operator_2.user_friendly_id
        self.assertNotEqual(
            user_operator_1_friendly_id, user_operator_2_friendly_id, "User friendly IDs should be unique."
        )
        self.assertEqual(
            user_operator_2_friendly_id, user_operator_1_friendly_id + 1, "User friendly IDs should increment"
        )


# RLS tests
class TestUserOperatorRls(BaseTestCase):
    def test_user_operator_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        random_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        assert UserOperator.objects.count() == 2  # Confirm two user_operators were created

        def select_function(cursor):
            assert UserOperator.objects.count() == 1  # User should only see their own user_operator

        def insert_function(cursor):
            new_user_operator = UserOperator.objects.create(
                operator=approved_user_operator.operator,
                user=baker.make_recipe('industry_operator_user'),
            )
            assert UserOperator.objects.filter(id=new_user_operator.pk).exists()

        # brianna I think they have to be allowed without being approved
        #     with pytest.raises(
        #         ProgrammingError, match='new row violates row-level security policy for table "user_operator'
        #     ):
        #         cursor.execute(
        #             """
        # INSERT INTO "erc"."user_operator" (
        #     legal_name,
        #     cra_business_number,
        #     bc_corporate_registry_number,
        #     bc_obps_operator_id, business_structure_id
        # ) VALUES (
        #     %s,
        #     %s,
        #     %s,
        #     %s,
        #     %s
        # )
        # """,
        #             (
        #                 'name names',
        #                 '123456789',
        #                 'ddd8888888',
        #                 random_operator.id,
        #                 'General Partnership',
        #             ),
        #         )

        def update_function(cursor):
            UserOperator.objects.update(status=UserOperator.Statuses.APPROVED)
            assert UserOperator.objects.filter(status=UserOperator.Statuses.APPROVED).count() == 1

        test_policies_for_industry_user(
            UserOperator,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )

    def test_user_operator_rls_cas_users(self):

        baker.make_recipe('registration.tests.utils.user_operator', _quantity=5)

        def select_function(cursor, i):
            assert UserOperator.objects.count() == 5

        test_policies_for_cas_roles(UserOperator, select_function=select_function)
