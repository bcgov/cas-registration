from common.tests.utils.helpers import BaseTestCase
from registration.models.business_structure import BusinessStructure
from registration.models.multiple_operator import MultipleOperator
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
    CONTACT_FIXTURE,
    OPERATOR_FIXTURE,
    DOCUMENT_FIXTURE,
)
from registration.tests.utils.bakers import (
    generate_random_bc_corporate_registry_number,
    generate_random_cra_business_number,
    multiple_operator_baker,
)
from django.db import ProgrammingError
from model_bakery import baker
import pytest
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


class MultipleOperatorModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, USER_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE, DOCUMENT_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = multiple_operator_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", None, None),
            ("bc_corporate_registry_number", "bc corporate registry number", None, None),
            ("business_structure", "business structure", None, None),
            ("attorney_address", "attorney address", None, None),
            ("operation", "operation", None, None),
        ]


# RLS tests
class TestMultipleOperatorRls(BaseTestCase):
    def test_multiple_operator_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        multiple_operator = baker.make_recipe(
            'registration.tests.utils.multiple_operator',
            operation=operation,
        )

        random_approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        random_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=random_approved_user_operator.operator
        )
        random_multiple_operator = baker.make_recipe(
            'registration.tests.utils.multiple_operator',
            operation=random_operation,
        )

        assert MultipleOperator.objects.count() == 2  # Two records created

        def select_function(cursor):
            assert MultipleOperator.objects.count() == 1

        def insert_function(cursor):
            new_multiple_operator = MultipleOperator.objects.create(
                operation=operation,
                cra_business_number=generate_random_cra_business_number(),
                bc_corporate_registry_number=generate_random_bc_corporate_registry_number(),
                business_structure=BusinessStructure.objects.first(),
                legal_name='New Legal Name',
                trade_name='New Trade Name',
            )
            assert MultipleOperator.objects.filter(operation_id=new_multiple_operator.operation_id).exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "multiple_operator',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."multiple_operator" (
                        operation_id,
                        cra_business_number,
                        bc_corporate_registry_number,
                        business_structure_id, legal_name, trade_name
                    ) VALUES (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                """,
                    (
                        random_operation.id,
                        111111111,
                        'abc1234567',
                        'General Partnership',
                        'Random Legal Name',
                        'Random Trade Name',
                    ),
                )

        def update_function(cursor):
            multiple_operator.legal_name = 'Updated Legal Name'
            multiple_operator.save()
            assert MultipleOperator.objects.filter(legal_name='Updated Legal Name').count() == 1

        test_policies_for_industry_user(
            MultipleOperator,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )

    def test_multiple_operator_rls_cas_users(self):

        baker.make_recipe(
            'registration.tests.utils.multiple_operator',
            _quantity=5,
        )

        def select_function(cursor, i):
            assert MultipleOperator.objects.count() == 5

        test_policies_for_cas_roles(
            MultipleOperator,
            select_function=select_function,
        )
