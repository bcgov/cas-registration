from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
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

        # create two user_operators to set up for transfers
        new_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        old_user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        # operation
        operation = make_recipe(
            'registration.tests.utils.operation', operator=new_user_operator.operator, status="Registered"
        )
        # timeline of current and historical ownership
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=old_user_operator.operator,
        )
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=new_user_operator.operator,
        )
        # old operator's data
        old_operator_report = make_recipe(
            'reporting.tests.utils.report', operation=operation, operator=old_user_operator.operator
        )
        old_operator_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', report=old_operator_report
        )

        # new operator's data
        new_operator_report = make_recipe(
            'reporting.tests.utils.report', operation=operation, operator=new_user_operator.operator
        )
        new_operator_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', report=new_operator_report
        )

        # extra objects for insert function
        new_operator_report_2 = make_recipe(
            'reporting.tests.utils.report', operation=operation, operator=new_user_operator.operator
        )
        old_report_2 = make_recipe(
            'reporting.tests.utils.report', operation=operation, operator=old_user_operator.operator
        )

        assert ComplianceReport.objects.count() == 2

        # test to access currently owned operation data
        def select_function(cursor):
            ComplianceReport.objects.get(id=new_operator_compliance_report.id)

        def forbidden_select_function(cursor):
            ComplianceReport.objects.get(id=old_operator_compliance_report.id)

        def insert_function(cursor):
            ComplianceReport.objects.create(
                report=new_operator_report_2,
                bccr_subaccount_id="123456789099999",
                compliance_period=compliance_period,
            )

        def forbidden_insert_function(cursor):
            ComplianceReport.objects.create(
                report=old_report_2,
                bccr_subaccount_id="123456789099999",
                compliance_period=compliance_period,
            )

        def update_function(cursor):
            return ComplianceReport.objects.filter(id=new_operator_compliance_report.id).update(
                bccr_subaccount_id="111111111199999"
            )

        def forbidden_update_function(cursor):
            return ComplianceReport.objects.filter(id=old_operator_compliance_report.id).update(
                bccr_subaccount_id="111111111199999"
            )

        def delete_function(cursor):
            return ComplianceReport.objects.filter(id=new_operator_compliance_report.id).delete()

        def forbidden_delete_function(cursor):
            ComplianceReport.objects.filter(id=old_operator_compliance_report.id).delete()

        assert_policies_for_industry_user(
            ComplianceReport,
            new_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

        # test to access previously owned operation data
        def select_function(cursor):
            ComplianceReport.objects.get(id=old_operator_compliance_report.id)

        def forbidden_select_function(cursor):
            ComplianceReport.objects.get(id=new_operator_compliance_report.id)

        def insert_function(cursor):

            ComplianceReport.objects.create(
                report=old_report_2,
                bccr_subaccount_id="123456789099999",
                compliance_period=compliance_period,
            )

        def forbidden_insert_function(cursor):
            ComplianceReport.objects.create(
                report=new_operator_report_2,
                bccr_subaccount_id="123456789099999",
                compliance_period=compliance_period,
            )

        def update_function(cursor):
            return ComplianceReport.objects.filter(id=old_operator_compliance_report.id).update(
                bccr_subaccount_id="111111111199999"
            )

        def forbidden_update_function(cursor):
            return ComplianceReport.objects.filter(id=new_operator_compliance_report.id).update(
                bccr_subaccount_id="111111111199999"
            )

        def delete_function(cursor):
            return ComplianceReport.objects.filter(id=old_operator_compliance_report.id).delete()

        def forbidden_delete_function(cursor):
            ComplianceReport.objects.filter(id=new_operator_compliance_report.id).delete()

        assert_policies_for_industry_user(
            ComplianceReport,
            old_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_compliance_report_rls_cas_users(self):
        operator = make_recipe('registration.tests.utils.operator')
        operation = make_recipe('registration.tests.utils.operation', operator=operator)
        report = make_recipe('reporting.tests.utils.report', id=99, operation=operation)
        make_recipe('compliance.tests.utils.compliance_report', id=88, report=report)

        def select_function(cursor):
            assert ComplianceReport.objects.count() == 1

        assert_policies_for_cas_roles(
            ComplianceReport,
            select_function=select_function,
        )
