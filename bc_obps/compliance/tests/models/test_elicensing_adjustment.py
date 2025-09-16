from decimal import Decimal
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ElicensingAdjustmentTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            'compliance.tests.utils.elicensing_adjustment',
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("elicensing_line_item", "elicensing line item", None, None),
            ("adjustment_object_id", "adjustment object id", None, None),
            ("amount", "amount", None, None),
            ("adjustment_date", "adjustment date", None, None),
            ("reason", "reason", None, None),
            ("type", "type", None, None),
            ("comment", "comment", None, None),
            ("supplementary_compliance_report_version", "supplementary compliance report version", None, None),
        ]


#  RLS tests
class TestElicensingAdjustmentRls(BaseTestCase):
    def test_elicensing_adjustment_rls_industry_user(self):
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
        approved_line_item = make_recipe(
            'compliance.tests.utils.elicensing_line_item', elicensing_invoice=approved_invoice
        )
        approved_elicensing_adjustment = make_recipe(
            'compliance.tests.utils.elicensing_adjustment', id=88, elicensing_line_item=approved_line_item
        )

        # second object
        random_operator = make_recipe('registration.tests.utils.operator', id=2)
        random_client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator', operator=random_operator, client_object_id="1147483647"
        )
        random_invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', elicensing_client_operator=random_client_operator
        )
        random_line_item = make_recipe('compliance.tests.utils.elicensing_line_item', elicensing_invoice=random_invoice)
        random_elicensing_adjustment = make_recipe(
            'compliance.tests.utils.elicensing_adjustment', elicensing_line_item=random_line_item
        )

        assert ElicensingAdjustment.objects.count() == 2

        def select_function(cursor):
            ElicensingAdjustment.objects.get(id=approved_elicensing_adjustment.id)

        def forbidden_select_function(cursor):
            ElicensingAdjustment.objects.get(id=random_elicensing_adjustment.id)

        def insert_function(cursor):
            ElicensingAdjustment.objects.create(
                elicensing_line_item=approved_line_item, adjustment_object_id=888888, amount=888
            )

        def forbidden_insert_function(cursor):

            cursor.execute(
                """
                    INSERT INTO "erc"."elicensing_adjustment" (
                        elicensing_line_item_id
                    ) VALUES (
                        %s
                    )
                """,
                (random_line_item.id,),
            )

        def update_function(cursor):
            return ElicensingAdjustment.objects.filter(id=approved_elicensing_adjustment.id).update(
                amount=Decimal('999')
            )

        def forbidden_update_function(cursor):
            return ElicensingAdjustment.objects.filter(id=random_elicensing_adjustment.id).update(amount=Decimal('999'))

        assert_policies_for_industry_user(
            ElicensingAdjustment,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
        )

    def test_elicensing_adjustment_rls_cas_users(self):
        operator = make_recipe('registration.tests.utils.operator')
        client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator', operator=operator)
        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', elicensing_client_operator=client_operator)
        line_item = make_recipe('compliance.tests.utils.elicensing_line_item', id=88, elicensing_invoice=invoice)
        make_recipe('compliance.tests.utils.elicensing_adjustment', elicensing_line_item=line_item)

        def select_function(cursor):
            assert ElicensingAdjustment.objects.count() == 1

        assert_policies_for_cas_roles(
            ElicensingAdjustment,
            select_function=select_function,
        )
