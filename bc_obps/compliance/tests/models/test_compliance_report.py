from rls.tests.helpers import assert_policies_for_industry_user
import pytest
from django.db import ProgrammingError
from compliance.models.compliance_report import ComplianceReport
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ComplianceReportTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_report')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report", "report", None, None),
            ("compliance_period", "compliance period", None, None),
            ("bccr_subaccount_id", "bccr subaccount id", None, None),
            ("compliance_report_versions", "compliance report version", None, None),
        ]


#  RLS tests
class TestComplianceReportRls(BaseTestCase):
    def test_compliance_report_rls_industry_user(self):
        compliance_period = make_recipe('compliance.tests.utils.compliance_period')
        # approved object
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        # operation belonging to the approved user operator
        approved_operation = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status="Registered"
        )
        approved_report = make_recipe(
            'reporting.tests.utils.report', operation=approved_operation, operator=approved_user_operator.operator
        )
        make_recipe('compliance.tests.utils.compliance_report', report=approved_report)

        # second object
        random_operator = make_recipe('registration.tests.utils.operator')
        # operation belonging to a random operator
        random_operation = make_recipe('registration.tests.utils.operation', operator=random_operator)
        random_report = make_recipe('reporting.tests.utils.report', operation=random_operation)
        make_recipe('compliance.tests.utils.compliance_report', report=random_report)

        # extra objects for insert function
        approved_report_2 = make_recipe(
            'reporting.tests.utils.report', operation=approved_operation, operator=approved_user_operator.operator
        )
        random_report_2 = make_recipe('reporting.tests.utils.report', operation=random_operation)

        assert ComplianceReport.objects.count() == 2

        def select_function(cursor):
            assert ComplianceReport.objects.count() == 1

        def insert_function(cursor):
            ComplianceReport.objects.create(
                report=approved_report_2,
                bccr_subaccount_id="123456789099999",
                compliance_period=compliance_period,
            )

            assert ComplianceReport.objects.filter(bccr_subaccount_id="123456789099999").exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "compliance_report',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."compliance_report" (
                        report_id
                    ) VALUES (
                        %s
                    )
                """,
                    (random_report_2.id,),
                )

        def update_function(cursor):
            ComplianceReport.objects.update(bccr_subaccount_id="111111111199999")
            assert ComplianceReport.objects.filter(bccr_subaccount_id="111111111199999").count() == 1

        def delete_function(cursor):
            ComplianceReport.objects.filter(bccr_subaccount_id="111111111199999").delete()
            assert ComplianceReport.objects.filter(bccr_subaccount_id="111111111199999").count() == 0

        assert_policies_for_industry_user(
            ComplianceReport,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
        )
