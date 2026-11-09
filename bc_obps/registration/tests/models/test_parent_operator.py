from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    CONTACT_FIXTURE,
    OPERATOR_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
)
from registration.tests.utils.bakers import parent_operator_baker
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from model_bakery.baker import make_recipe
from registration.models import ParentOperator


class ParentOperatorModelTest(BaseTestCase):
    fixtures = [
        USER_FIXTURE,
        ADDRESS_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = parent_operator_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("child_operator", "child operator", None, None),
            ("operator_index", "operator index", None, None),
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", None, None),
            ("bc_corporate_registry_number", "bc corporate registry number", None, None),
            ("business_structure", "business structure", None, None),
            ("website", "website", 200, None),
            ("physical_address", "physical address", None, None),
            ("mailing_address", "mailing address", None, None),
            ("foreign_tax_id_number", "foreign tax id number", 1000, None),
            ("foreign_address", "foreign address", 2000, None),
        ]


class ParentOperatorRlsTest(BaseTestCase):

    def test_parent_operator_rls_industry_user(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        approved_parent = make_recipe(
            'registration.tests.utils.canadian_parent_operator', child_operator=approved_user_operator.operator
        )
        other_operator = make_recipe('registration.tests.utils.operator')
        other_parent = make_recipe('registration.tests.utils.canadian_parent_operator', child_operator=other_operator)

        def select_function(cursor):
            ParentOperator.objects.get(id=approved_parent.id)

        def forbidden_select_function(cursor):
            ParentOperator.objects.get(id=other_parent.id)

        def insert_function(cursor):
            ParentOperator.objects.create(
                child_operator=approved_user_operator.operator,
                legal_name='test',
                trade_name='test',
                cra_business_number=888888888,
                bc_corporate_registry_number='v8888888',
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO erc.parent_operator(child_operator_id, legal_name, trade_name, cra_business_number, bc_corporate_registry_number)
                    VALUES(%s, 'test', 'test', 777777777, 'a7777777')
                """,
                (other_operator.id,),
            )
            return cursor.rowcount

        def update_function(cursor):
            cursor.execute(
                """
                    update erc.parent_operator set legal_name='test'
                    where id = %s
                """,
                (approved_parent.id,),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    update erc.parent_operator set legal_name='test'
                    where id = %s
                """,
                (other_parent.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ParentOperator,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
        )

    def test_parent_operator_rls_cas_user(self):
        test_quantity = 2
        operator = make_recipe('registration.tests.utils.operator')
        make_recipe("registration.tests.utils.canadian_parent_operator", child_operator=operator)
        make_recipe("registration.tests.utils.canadian_parent_operator", child_operator=operator)

        def select_function(cursor):
            assert ParentOperator.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ParentOperator,
            select_function=select_function,
        )
