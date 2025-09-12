import pytest
from django.db import ProgrammingError
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from compliance.models.elicensing_client_operator import ElicensingClientOperator


class ElicensingClientOperatorTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.elicensing_client_operator')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operator", "operator", None, None),
            ("client_object_id", "client object id", None, None),
            ("client_guid", "client guid", None, None),
            ("elicensing_invoices", "elicensing invoice", None, None),
        ]


#  RLS tests
class TestElicensingClientOperatorRls(BaseTestCase):
    def test_elicensing_client_operator_rls_industry_user(self):
        # approved object
        operator = make_recipe('registration.tests.utils.operator', id=1)
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator', operator=operator)
        # operation belonging to the approved user operator
        make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
            operator=approved_user_operator.operator,
            client_object_id="1147483647",
        )

        # second object
        random_operator = make_recipe('registration.tests.utils.operator', id=2)
        # operation belonging to a random operator
        make_recipe(
            'compliance.tests.utils.elicensing_client_operator', operator=random_operator, client_object_id="1147483647"
        )

        assert ElicensingClientOperator.objects.count() == 2

        def select_function(cursor):
            assert ElicensingClientOperator.objects.count() == 1

        def insert_function(cursor):
            ElicensingClientOperator.objects.create(
                operator_id=approved_user_operator.operator.id,
                client_object_id="2147483646",
                client_guid="d7611864-7e81-4eb8-91e2-3562f952d002",
            )

            assert ElicensingClientOperator.objects.filter(operator_id=approved_user_operator.operator.id).exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "elicensing_client_operator"',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."elicensing_client_operator" (
                        operator_id
                    ) VALUES (
                        %s
                    )
                """,
                    (random_operator.id,),
                )

        def update_function(cursor):
            ElicensingClientOperator.objects.update(client_object_id="2147483647")
            assert ElicensingClientOperator.objects.filter(client_object_id="2147483647").count() == 1

        # def forbidden_delete_function(cursor):
        #     ElicensingClientOperator.objects.filter(client_object_id="1147483647").delete()

        assert_policies_for_industry_user(
            ElicensingClientOperator,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            # forbidden_delete_function=forbidden_delete_function,
            test_forbidden_ops=True,
        )

    def test_elicensing_client_operator_rls_cas_users(self):
        operator = make_recipe('registration.tests.utils.operator')
        make_recipe('compliance.tests.utils.elicensing_client_operator', id=88, operator=operator)

        def select_function(cursor):
            assert ElicensingClientOperator.objects.count() == 1

        assert_policies_for_cas_roles(
            ElicensingClientOperator,
            select_function=select_function,
        )
