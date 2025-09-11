from decimal import Decimal
import pytest
from django.db import ProgrammingError
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.elicensing_line_item import ElicensingLineItem
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ElicensingLineItemTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            'compliance.tests.utils.elicensing_line_item',
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("elicensing_invoice", "elicensing invoice", None, None),
            ("object_id", "object id", None, None),
            ("guid", "guid", None, None),
            ("line_item_type", "line item type", None, None),
            ("fee_date", "fee date", None, None),
            ("description", "description", None, None),
            ("base_amount", "base amount", None, None),
            ("elicensing_payments", "elicensing payment", None, None),
            ("elicensing_adjustments", "elicensing adjustment", None, None),
        ]


#  RLS tests
class TestElicensingLineItemRls(BaseTestCase):
    def test_elicensing_line_item_rls_industry_user(self):
        # approved object
        operator = make_recipe('registration.tests.utils.operator', id=1)
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator', operator=operator)
        approved_client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
            operator=approved_user_operator.operator,
            client_object_id="1147483647",
        )
        approved_invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', elicensing_client_operator=approved_client_operator
        )
        make_recipe('compliance.tests.utils.elicensing_line_item', id=88, elicensing_invoice=approved_invoice)

        # second object
        random_operator = make_recipe('registration.tests.utils.operator', id=2)
        random_client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator', operator=random_operator, client_object_id="1147483647"
        )
        random_invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', elicensing_client_operator=random_client_operator
        )
        make_recipe('compliance.tests.utils.elicensing_line_item', elicensing_invoice=random_invoice)

        assert ElicensingLineItem.objects.count() == 2

        def select_function(cursor):
            assert ElicensingLineItem.objects.count() == 1

        def insert_function(cursor):
            ElicensingLineItem.objects.create(
                elicensing_invoice=approved_invoice,
                object_id=123456,
                guid="550e8400-e29b-41d4-a716-446655440000",
                fee_date='2024-10-01',
                base_amount=Decimal('888'),
            )

            assert ElicensingLineItem.objects.filter(object_id=123456).exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "elicensing_line_item"',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."elicensing_line_item" (
                        elicensing_invoice_id
                    ) VALUES (
                        %s
                    )
                """,
                    (random_invoice.id,),
                )

        def update_function(cursor):
            ElicensingLineItem.objects.update(base_amount=Decimal('999'))
            assert ElicensingLineItem.objects.filter(base_amount=Decimal('999')).count() == 1

        def forbidden_delete_function(cursor):
            ElicensingLineItem.objects.filter(id=88).delete()

        assert_policies_for_industry_user(
            ElicensingLineItem,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            forbidden_delete_function=forbidden_delete_function,
            test_forbidden_ops=True,
        )

    def test_elicensing_line_item_rls_cas_users(self):
        operator = make_recipe('registration.tests.utils.operator', id=3)
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator', operator=operator, client_object_id="1147488888"
        )
        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', elicensing_client_operator=client_operator)
        make_recipe('compliance.tests.utils.elicensing_line_item', id=888, elicensing_invoice=invoice)

        def select_function(cursor):
            assert ElicensingLineItem.objects.count() == 1

        def forbidden_insert_function(cursor):
            ElicensingLineItem.objects.create(
                elicensing_invoice=invoice,
                object_id=888888,
                fee_date='2024-10-01',
                base_amount=Decimal('888'),
                guid="550e8400-e29b-41d4-a716-000000000000",
            )

        def forbidden_update_function(cursor):
            ElicensingLineItem.objects.filter(id=888).update(description="This is not allowed to be updated")

        def forbidden_delete_function(cursor):
            ElicensingLineItem.objects.filter(id=888).delete()

        assert_policies_for_cas_roles(
            ElicensingLineItem,
            select_function=select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
            test_forbidden_ops=True,
        )
