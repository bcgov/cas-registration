from decimal import Decimal
import pytest
from django.db import ProgrammingError
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.elicensing_invoice import ElicensingInvoice
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ElicensingInvoiceTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.elicensing_invoice')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("invoice_number", "invoice number", None, None),
            ("elicensing_client_operator", "elicensing client operator", None, None),
            ("due_date", "due date", None, None),
            ("outstanding_balance", "outstanding balance", None, None),
            ("invoice_fee_balance", "invoice fee balance", None, None),
            ("invoice_interest_balance", "invoice interest balance", None, None),
            ("is_void", "is void", None, None),
            ("last_refreshed", "last refreshed", None, None),
            ("elicensing_line_items", "elicensing line item", None, None),
            ("compliance_obligation", "compliance obligation", None, None),
            ("compliance_penalty", "compliance penalty", None, None),
        ]


#  RLS tests
class TestElicensingInvoiceRls(BaseTestCase):
    def test_elicensing_invoice_rls_industry_user(self):
        # approved object
        operator = make_recipe('registration.tests.utils.operator', id=1)
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator', operator=operator)
        approved_client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
            operator=approved_user_operator.operator,
            client_object_id="1147483647",
        )
        make_recipe(
            'compliance.tests.utils.elicensing_invoice', id=88, elicensing_client_operator=approved_client_operator
        )

        # second object
        random_operator = make_recipe('registration.tests.utils.operator', id=2)
        random_client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator', operator=random_operator, client_object_id="1147483647"
        )
        make_recipe('compliance.tests.utils.elicensing_invoice', elicensing_client_operator=random_client_operator)

        assert ElicensingInvoice.objects.count() == 2

        def select_function(cursor):
            assert ElicensingInvoice.objects.count() == 1

        def insert_function(cursor):
            ElicensingInvoice.objects.create(
                elicensing_client_operator=approved_client_operator,
                outstanding_balance=Decimal('888'),
                invoice_fee_balance=Decimal('100.01'),
                invoice_interest_balance=Decimal('0.00'),
                invoice_number="INV-0002",
                due_date='2024-11-30',
                last_refreshed='2024-10-01 00:00:00',
                is_void=False,
            )

            assert ElicensingInvoice.objects.filter(outstanding_balance=Decimal('888')).exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "elicensing_invoice"',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."elicensing_invoice" (
                        elicensing_client_operator_id
                    ) VALUES (
                        %s
                    )
                """,
                    (random_client_operator.id,),
                )

        def update_function(cursor):
            ElicensingInvoice.objects.update(invoice_fee_balance=Decimal('999'))
            assert ElicensingInvoice.objects.filter(invoice_fee_balance=Decimal('999')).count() == 1

        # def forbidden_delete_function(cursor):
        #     ElicensingInvoice.objects.filter(id=88).delete()

        assert_policies_for_industry_user(
            ElicensingInvoice,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            # forbidden_delete_function=forbidden_delete_function,
            test_forbidden_ops=True,
        )

    def test_elicensing_invoice_rls_cas_users(self):
        operator = make_recipe('registration.tests.utils.operator', id=3)
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator', operator=operator, client_object_id="1147488888"
        )
        make_recipe('compliance.tests.utils.elicensing_invoice', id=888, elicensing_client_operator=client_operator)

        def select_function(cursor):
            assert ElicensingInvoice.objects.count() == 1

        assert_policies_for_cas_roles(
            ElicensingInvoice,
            select_function=select_function,
        )
