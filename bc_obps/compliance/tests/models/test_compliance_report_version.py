import pytest
from model_bakery.baker import make_recipe
from django.db import ProgrammingError
from compliance.models.compliance_report_version import ComplianceReportVersion
from rls.tests.helpers import assert_policies_for_industry_user
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS


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
        ]


#  RLS tests
class TestComplianceReportVersionRls(BaseTestCase):
    def test_compliance_report_version_rls_industry_user(self):
        # first object
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        # operation belonging to the approved user operator
        approved_operation = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status="Registered"
        )
        approved_report = make_recipe(
            'reporting.tests.utils.report', operation=approved_operation, operator=approved_user_operator.operator
        )
        approved_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            report=approved_report,
        )
        approved_report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=approved_report_version
        )
        # Create approved compliance report
        approved_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=approved_report)
        # create a compliance report version for the approved compliance report version
        make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=approved_compliance_report)

        # second object
        random_operator = make_recipe('registration.tests.utils.operator')
        # operation belonging to a random operator
        random_operation = make_recipe('registration.tests.utils.operation', operator=random_operator)
        random_report = make_recipe('reporting.tests.utils.report', operation=random_operation)
        random_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            report=random_report,
        )
        random_report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=random_report_version
        )
        # random compliance report
        random_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=random_report)
        # create a compliance report version for the random compliance report version
        make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=random_compliance_report)

        assert ComplianceReportVersion.objects.count() == 2  # Two operations created

        def select_function(cursor):
            assert ComplianceReportVersion.objects.count() == 1

        def insert_function(cursor):
            ComplianceReportVersion.objects.create(
                compliance_report=approved_compliance_report,
                report_compliance_summary=approved_report_compliance_summary,
                status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
                excess_emissions_delta_from_previous=10,
                credited_emissions_delta_from_previous=10,
                is_supplementary=False,
            )

            assert ComplianceReportVersion.objects.filter(
                compliance_report=approved_compliance_report,
                report_compliance_summary=approved_report_compliance_summary,
                excess_emissions_delta_from_previous=10,
                credited_emissions_delta_from_previous=10,
                is_supplementary=False,
                status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
            ).exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "compliance_report_version',
            ):
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
                        random_compliance_report.id,
                        random_report_compliance_summary.id,
                        "Obligation fully met",
                        10,
                        10,
                        False,
                    ),
                )

        def update_function(cursor):
            ComplianceReportVersion.objects.update(status='No obligation or earned credits')
            assert (
                ComplianceReportVersion.objects.filter(status='No obligation or earned credits').count() == 1
            )  # only affected 1

        def delete_function(cursor):
            ComplianceReportVersion.objects.filter(status='No obligation or earned credits').delete()
            assert (
                ComplianceReportVersion.objects.filter(status='No obligation or earned credits').count() == 0
            )  # only deleted 1

        assert_policies_for_industry_user(
            ComplianceReportVersion,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
        )
