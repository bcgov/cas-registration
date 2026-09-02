from model_bakery.baker import make_recipe
from compliance.models.compliance_report_version import ComplianceReportVersion
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from compliance.tests.utils.compliance_rls_test_infrastructure import ComplianceReportRlsTestSetup


class ComplianceReportVersionTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_report_version')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_report", "compliance report", None, None),
            ("report_compliance_summary", "report compliance summary", None, None),
            ("excess_emissions_delta_from_previous", "excess emissions delta from previous", None, None),
            ("credited_emissions_delta_from_previous", "credited emissions delta from previous", None, None),
            ("status", "status", None, None),
            ("compliance_earned_credit", "compliance earned credit", None, None),
            ("obligation", "compliance obligation", None, None),
            ("is_supplementary", "is supplementary", None, None),
            ("elicensing_adjustments", "elicensing adjustment", None, None),
            ("previous_version", "previous version", None, None),
            ("subsequent_versions", "compliance report version", None, None),
            ("manual_handling_record", "compliance report version manual handling", None, None),
        ]


#  RLS tests
class TestComplianceReportVersionRls(BaseTestCase):
    def test_compliance_report_version_rls_industry_user(self):
        t = ComplianceReportRlsTestSetup()
        mock_report_version = make_recipe(
            'reporting.tests.utils.report_version', report=t.compliance_report_2010.report
        )
        mock_compliance_report_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=mock_report_version
        )
        assert ComplianceReportVersion.objects.count() == 2

        # test to access currently owned operation data
        def select_function(cursor):
            ComplianceReportVersion.objects.get(id=t.compliance_report_version_2010.id)

        def forbidden_select_function(cursor):
            ComplianceReportVersion.objects.get(id=t.compliance_report_version_2013.id)

        def insert_function(cursor):
            ComplianceReportVersion.objects.create(
                compliance_report=t.compliance_report_2010,
                report_compliance_summary=mock_compliance_report_summary,
                status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
                excess_emissions_delta_from_previous=10,
                credited_emissions_delta_from_previous=10,
                is_supplementary=True,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO "erc"."compliance_report_version" (
                        compliance_report_id,
                        report_compliance_summary_id,
                        status,
                        excess_emissions_delta_from_previous,
                        credited_emissions_delta_from_previous,
                        is_supplementary
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
                    t.compliance_report_2013.id,
                    mock_compliance_report_summary.id,
                    "Obligation fully met",
                    10,
                    10,
                    True,
                ),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_report_version"
                    SET status = %s
                    WHERE id = %s
                """,
                (
                    ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
                    t.compliance_report_version_2010.id,
                ),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_report_version"
                    SET status = %s
                    WHERE id = %s
                """,
                (
                    ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
                    t.compliance_report_version_2013.id,
                ),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceReportVersion,
            t.approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
        )

    def test_compliance_report_version_rls_cas_users(self):
        ComplianceReportRlsTestSetup()

        def select_function(cursor):
            assert ComplianceReportVersion.objects.count() == 2

        assert_policies_for_cas_roles(
            ComplianceReportVersion,
            select_function=select_function,
        )
