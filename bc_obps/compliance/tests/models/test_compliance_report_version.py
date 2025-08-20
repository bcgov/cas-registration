from django.db import ProgrammingError
from registration.models.operation import Operation
from registration.models.naics_code import NaicsCode
from reporting.models.report_compliance_summary import ReportComplianceSummary
from compliance.models.compliance_report_version import ComplianceReportVersion
# from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.tests.utils.helpers import BaseTestCase
from rls.tests.helpers import assert_policies_for_industry_user

from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe, make
import pytest


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
        ]

#  RLS tests
class TestComplianceReportVersionRls(BaseTestCase):
    def test_compliance_report_version_rls_industry_user(self):
        # first object
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        # operation belonging to the approved user operator
        naics = NaicsCode.objects.first()

        # approved_operation = make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator, status="Registered", naics_code=naics)
        approved_operation = make(Operation, operator=approved_user_operator.operator, status="Registered", naics_code=naics)
        # approved report
        approved_report = make_recipe('reporting.tests.utils.report', operation=approved_operation, operator=approved_user_operator.operator)
        approved_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            report=approved_report,
        )
        approved_report_compliance_summary = make_recipe('reporting.tests.utils.report_compliance_summary', report_version=approved_report_version)
        # Create compliance report
        # approved compliance report
        approved_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=approved_report)
        # create a compliance report version for the approved compliance report version
        make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=approved_compliance_report)

        # second object
        random_operator = make_recipe('registration.tests.utils.operator')
        # operation belonging to a random operator
        random_operation = make_recipe('registration.tests.utils.operation', operator=random_operator)
        # random report
        random_report = make_recipe('reporting.tests.utils.report', operation=random_operation)
        make_recipe(
            'reporting.tests.utils.report_version',
            report=random_report,
        )
        # random compliance report
        random_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=random_report)
        # create a compliance report version for the random compliance report version
        make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=random_compliance_report)

        assert ComplianceReportVersion.objects.count() == 2  # Two operations created

        def select_function(cursor):
            assert ComplianceReportVersion.objects.count() == 1

        def insert_function(cursor):
            # new approved report
            # new_approved_report = make_recipe('reporting.tests.utils.report', operation=approved_operation, operator=approved_user_operator.operator, reporting_year=null)
            # new_approved_report_version = make_recipe(
            #     'reporting.tests.utils.report_version',
            #     report=new_approved_report,
            # )
            # # new approved compliance report
            # new_approved_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=new_approved_report)
            # naics = NaicsCode.objects.first()
            # breakpoint()
            # new_report_compliance_summary = make_recipe('reporting.tests.utils.report_compliance_summary')
            # Create compliance report version
            # ComplianceReportVersion.objects.create(
            #     compliance_report=approved_compliance_report,
            #     # report_compliance_summary=new_report_compliance_summary,
            #     status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
            #     excess_emissions_delta_from_previous=10,
            #     credited_emissions_delta_from_previous=10,
            #     is_supplementary=True,
            #     compliance_report__report__operation__operator=approved_user_operator.operator,
            #     # compliance_report__report__operation__naics_code=naics,
            # )
            # make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=new_approved_compliance_report, status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET, excess_emissions_delta_from_previous=10, credited_emissions_delta_from_previous=10, is_supplementary=True)
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
                    approved_compliance_report.id,
                    approved_report_compliance_summary.id,
                    ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
                    10,
                    10,
                    True,
                ),
            )


            assert ComplianceReportVersion.objects.filter(
                compliance_report=approved_compliance_report,
                report_compliance_summary=approved_report_compliance_summary,
                excess_emissions_delta_from_previous=10,
                credited_emissions_delta_from_previous=10,
                is_supplementary=True,
                status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET).exists()

            # with pytest.raises(
            #     ProgrammingError, match='new row violates row-level security policy for table "compliance_report_version'
            # ):
            #     cursor.execute(
            #         """
            #         INSERT INTO "erc"."compliance_report_version" (
            #             compliance_report_id,
            #             report_compliance_summary_id,
            #             status,
            #             excess_emissions_delta_from_previous,
            #             credited_emissions_delta_from_previous,
            #             is_supplementary
            #         ) VALUES (
            #             %s,
            #             %s,
            #             %s,
            #             %s,
            #             %s,
            #             %s
            #         )
            #     """,
            #         (
            #             compliance_report.id,
            #             random_compliance_report.id,
            #             "Obligation fully met",
            #             10,
            #             10,
            #             False,
            #         ),
            #     )

        # def update_function(cursor):
        #     ComplianceReportVersion.objects.update(name='name updated')
        #     assert ComplianceReportVersion.objects.filter(name='name updated').count() == 1  # only affected 1

        assert_policies_for_industry_user(
            ComplianceReportVersion,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            # update_function=update_function,
        )

    # def test_operation_rls_cas_users(self):

    #     make_recipe(
    #         'registration.tests.utils.operation',
    #         _quantity=5,
    #         operator=make_recipe('registration.tests.utils.operator'),
    #         status=Operation.Statuses.REGISTERED,
    #     )

    #     # we have to create up here because in the update_function, the role is cas, and they don't have permission to create bcghg ids
    #     bcghg_id = make_recipe('registration.tests.utils.bcghg_id')

    #     def select_function(cursor):
    #         assert Operation.objects.count() == 5

    #     def update_function(cursor):

    #         updated_operation = Operation.objects.first()
    #         updated_operation.bcghg_id = bcghg_id
    #         updated_operation.save()

    #         assert Operation.objects.filter(bcghg_id__isnull=False).count() == 1

    #     assert_policies_for_cas_roles(Operation, select_function=select_function, update_function=update_function)
