from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
from registration.models.parent_operator import ParentOperator
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    CONTACT_FIXTURE,
    OPERATOR_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
)
from registration.tests.utils.bakers import parent_operator_baker
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user
from model_bakery import baker


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


# RLS tests
class TestParentOperatorRls(BaseTestCase):
    def test_parent_operator_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        parent_operator = baker.make_recipe(
            'registration.tests.utils.canadian_parent_operator', child_operator=approved_user_operator.operator
        )
        random_operator = baker.make_recipe('registration.tests.utils.operator')
        random_parent_operator = baker.make_recipe(
            'registration.tests.utils.canadian_parent_operator', child_operator=random_operator
        )

        assert ParentOperator.objects.count() == 2  # Confirm two parent_operators were created

        def select_function(cursor):
            assert ParentOperator.objects.count() == 1  # User should only see their own parent_operator

        def insert_function(cursor):
            ParentOperator.objects.create(
                legal_name='legal name',
                child_operator=approved_user_operator.operator,
            )
            assert ParentOperator.objects.filter(legal_name='legal name').exists()

            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "parent_operator'
            ):
                cursor.execute(
                    """
        INSERT INTO "erc"."parent_operator" (
            legal_name,
            child_operator_id
        ) VALUES (
            %s,
            %s
        )
        """,
                    (
                        'name names',
                        random_operator.id,
                    ),
                )

        def update_function(cursor):
            ParentOperator.objects.update(legal_name='Updated Name')
            assert ParentOperator.objects.filter(legal_name='Updated Name').count() == 1

        test_policies_for_industry_user(
            ParentOperator,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )

    def test_parent_operator_rls_cas_users(self):

        baker.make_recipe('registration.tests.utils.canadian_parent_operator', _quantity=5)

        def select_function(cursor, i):
            assert ParentOperator.objects.count() == 5

        test_policies_for_cas_roles(ParentOperator, select_function=select_function)
