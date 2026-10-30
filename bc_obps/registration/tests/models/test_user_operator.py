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
from model_bakery.baker import make_recipe
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user


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


class UserOperatorRlsTest(BaseTestCase):

    def test_user_operator_rls_industry_user(self):
        user = make_recipe('registration.tests.utils.industry_operator_user')
        other_user = make_recipe('registration.tests.utils.industry_operator_user')
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        other_user_operator = make_recipe('registration.tests.utils.user_operator')

        def select_function(cursor):
            UserOperator.objects.get(id=other_user_operator.id)

        def insert_function(cursor):
            UserOperator.objects.create(user=user, operator=approved_user_operator.operator)

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO "erc"."user_operator" (
                        user_id,
                        operator_id
                    ) VALUES (
                        %s,
                        %s
                    )
                """,
                (other_user.user_guid, other_user_operator.operator.id),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."user_operator"
                    SET status = 'Declined'
                    WHERE id = %s
                """,
                (other_user_operator.id,),
            )
            return cursor.rowcount

        def delete_function(cursor):
            user = User.objects.all().first()
            print("U_S_E_R: ", user)
            op = UserOperator.objects.first()
            # print("OP: ", op)
            # op.user = user
            # op.save()
            # print("OP: ", op)
            cursor.execute(
                """
                    Update "erc"."user_operator" set user_id = %s where id=%s;
                    DELETE from "erc"."user_operator"
                    WHERE user_id = %s
                """,
                (
                    user.user_guid,
                    op.id,
                    user.user_guid,
                ),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            op = UserOperator.objects.first()
            cursor.execute(
                """
                    DELETE from "erc"."user_operator"
                    WHERE id = %s
                """,
                (op.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            UserOperator,
            user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=None,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=None,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_user_operator_rls_cas_users(self):
        test_quantity = 2
        op = make_recipe("registration.tests.utils.user_operator", status="Pending")
        make_recipe(
            "registration.tests.utils.user_operator",
        )

        def select_function(cursor):
            assert UserOperator.objects.count() == test_quantity

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."user_operator"
                    SET status = 'Approved'
                    WHERE id = %s
                """,
                (str(op.id),),
            )
            return cursor.rowcount

        assert_policies_for_cas_roles(UserOperator, select_function=select_function, update_function=update_function)
