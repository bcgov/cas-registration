from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
from registration.models.partner_operator import PartnerOperator
from registration.models.business_structure import BusinessStructure
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user
from model_bakery import baker


# RLS tests
class TestPartnerOperatorRls(BaseTestCase):
    def test_partner_operator_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        partner_operator = baker.make_recipe(
            'registration.tests.utils.partner_operator', bc_obps_operator=approved_user_operator.operator
        )
        random_operator = baker.make_recipe('registration.tests.utils.operator')
        random_partner_operator = baker.make_recipe(
            'registration.tests.utils.partner_operator', bc_obps_operator=random_operator
        )

        assert PartnerOperator.objects.count() == 2  # Confirm two partner_operators were created

        def select_function(cursor):
            assert PartnerOperator.objects.count() == 1  # User should only see their own partner_operator

        def insert_function(cursor):
            PartnerOperator.objects.create(
                legal_name='legal name',
                cra_business_number=123456789,
                bc_corporate_registry_number='ddd8888888',
                bc_obps_operator=approved_user_operator.operator,
                business_structure=BusinessStructure.objects.first(),
            )
            assert PartnerOperator.objects.filter(legal_name='legal name').exists()

            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "partner_operator'
            ):
                cursor.execute(
                    """
        INSERT INTO "erc"."partner_operator" (
            legal_name,
            cra_business_number,
            bc_corporate_registry_number,
            bc_obps_operator_id, business_structure_id
        ) VALUES (
            %s,
            %s,
            %s,
            %s,
            %s
        )
        """,
                    (
                        'name names',
                        '123456789',
                        'ddd8888888',
                        random_operator.id,
                        'General Partnership',
                    ),
                )

        def update_function(cursor):
            PartnerOperator.objects.update(legal_name='Updated Name')
            assert PartnerOperator.objects.filter(legal_name='Updated Name').count() == 1

        test_policies_for_industry_user(
            PartnerOperator,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )

    def test_partner_operator_rls_cas_users(self):

        baker.make_recipe('registration.tests.utils.partner_operator', _quantity=5)

        def select_function(cursor, i):
            assert PartnerOperator.objects.count() == 5

        test_policies_for_cas_roles(PartnerOperator, select_function=select_function)
