from decimal import Decimal
import pytest
from django.db import ProgrammingError
from rls.tests.helpers import assert_policies_for_industry_user
from compliance.models.compliance_penalty import CompliancePenalty
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class CompliancePenaltyTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_penalty')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_obligation", "compliance obligation", None, None),
            ("elicensing_invoice", "elicensing invoice", None, None),
            ("accrual_start_date", "accrual start date", None, None),
            ("penalty_amount", "penalty amount", None, None),
            ("compliance_penalty_accruals", "compliance penalty accrual", None, None),
            ("fee_date", "fee date", None, None),
            ("penalty_type", "penalty type", 100, None),
        ]


#  RLS tests
class TestCompliancePenaltyRls(BaseTestCase):
    def test_compliance_penalty_rls_industry_user(self):
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
        make_recipe('compliance.tests.utils.compliance_penalty', elicensing_invoice=approved_invoice)

        # second object
        random_operator = make_recipe('registration.tests.utils.operator', id=2)
        random_client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator', operator=random_operator, client_object_id="1147483647"
        )
        random_invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', elicensing_client_operator=random_client_operator
        )
        make_recipe('compliance.tests.utils.compliance_penalty', elicensing_invoice=random_invoice)

        # extra object for insert
        approved_invoice_2 = make_recipe(
            'compliance.tests.utils.elicensing_invoice', elicensing_client_operator=approved_client_operator
        )
        approved_compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=approved_invoice_2,
        )

        assert CompliancePenalty.objects.count() == 2

        def select_function(cursor):
            assert CompliancePenalty.objects.count() == 1

        def insert_function(cursor):
            CompliancePenalty.objects.create(
                id=888,
                elicensing_invoice=approved_invoice_2,
                compliance_obligation=approved_compliance_obligation,
                accrual_start_date="2024-01-01",
            )

            assert CompliancePenalty.objects.filter(id=888).exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "compliance_penalty"',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."compliance_penalty" (
                        elicensing_invoice_id
                    ) VALUES (
                        %s
                    )
                """,
                    (random_invoice.id,),
                )

        def update_function(cursor):
            CompliancePenalty.objects.update(penalty_amount=Decimal('8888'))
            assert CompliancePenalty.objects.filter(penalty_amount=Decimal('8888')).count() == 1

        assert_policies_for_industry_user(
            CompliancePenalty,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )
