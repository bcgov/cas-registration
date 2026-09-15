from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.compliance_report import ComplianceReport
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from compliance.tests.utils.compliance_rls_test_infrastructure import ComplianceReportRlsTestSetup


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
        t = ComplianceReportRlsTestSetup()

        assert ComplianceReport.objects.count() == 2

        # test to access currently owned operation data
        def select_function(cursor):
            ComplianceReport.objects.get(id=t.compliance_report_2010.id)

        def forbidden_select_function(cursor):
            ComplianceReport.objects.get(id=t.compliance_report_2013.id)

        def insert_function(cursor):
            ComplianceReport.objects.create(
                report=t.report_2011, bccr_subaccount_id="123456789099999", compliance_period=t.compliance_period_2011
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."compliance_report"(report_id, bccr_subaccount_id, compliance_period_id)
                    values(%s, %s, %s)
                """,
                (t.report_2012.id, '123456789099999', t.compliance_period_2012.id),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_report"
                    SET bccr_subaccount_id = %s
                    WHERE id = %s
                """,
                ("111111111199999", t.compliance_report_2010.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_report"
                    SET bccr_subaccount_id = %s
                    WHERE id = %s
                """,
                ("111111111199999", t.compliance_report_2013.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceReport,
            t.approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
        )

    def test_compliance_report_rls_cas_users(self):
        ComplianceReportRlsTestSetup()

        def select_function(cursor):
            assert ComplianceReport.objects.count() == 2

        assert_policies_for_cas_roles(
            ComplianceReport,
            select_function=select_function,
        )
