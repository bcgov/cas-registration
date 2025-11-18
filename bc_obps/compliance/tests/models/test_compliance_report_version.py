from model_bakery.baker import make_recipe
from compliance.models.compliance_report_version import ComplianceReportVersion
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
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
            ("manual_handling_record", "compliance report version manual handling", None, None),
        ]


#  RLS tests
class TestComplianceReportVersionRls(BaseTestCase):
    def test_compliance_report_version_rls_industry_user(self):
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

        old_operator_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=old_operator_compliance_report
        )

        # new operator's data
        new_operator_report = make_recipe(
            'reporting.tests.utils.report', operation=operation, operator=new_user_operator.operator
        )
        new_operator_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', report=new_operator_report
        )

        new_operator_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=new_operator_compliance_report
        )

        # extra objects for insert function
        new_operator_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            report=new_operator_report,
        )

        new_operator_report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=new_operator_report_version
        )

        old_operator_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            report=old_operator_report,
        )

        old_operator_report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=old_operator_report_version
        )

        assert ComplianceReportVersion.objects.count() == 2

        # test to access currently owned operation data
        def select_function(cursor):
            ComplianceReportVersion.objects.get(id=new_operator_compliance_report_version.id)

        def forbidden_select_function(cursor):
            ComplianceReportVersion.objects.get(id=old_operator_compliance_report_version.id)

        def insert_function(cursor):
            ComplianceReportVersion.objects.create(
                compliance_report=new_operator_compliance_report,
                report_compliance_summary=new_operator_report_compliance_summary,
                status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
                excess_emissions_delta_from_previous=10,
                credited_emissions_delta_from_previous=10,
                is_supplementary=False,
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
                    old_operator_compliance_report.id,
                    old_operator_report_compliance_summary.id,
                    "Obligation fully met",
                    10,
                    10,
                    False,
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
                    new_operator_compliance_report_version.id,
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
                    old_operator_compliance_report_version.id,
                ),
            )
            return cursor.rowcount

        def delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_report_version"
                   WHERE id = %s
                """,
                (new_operator_compliance_report_version.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_report_version"
                   WHERE id = %s
                """,
                (old_operator_compliance_report_version.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceReportVersion,
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
            ComplianceReportVersion.objects.get(id=old_operator_compliance_report_version.id)

        def forbidden_select_function(cursor):
            ComplianceReportVersion.objects.get(id=new_operator_compliance_report_version.id)

        def insert_function(cursor):

            ComplianceReportVersion.objects.create(
                compliance_report=old_operator_compliance_report,
                report_compliance_summary=old_operator_report_compliance_summary,
                status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
                excess_emissions_delta_from_previous=10,
                credited_emissions_delta_from_previous=10,
                is_supplementary=False,
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
                    new_operator_compliance_report.id,
                    new_operator_report_compliance_summary.id,
                    "Obligation fully met",
                    10,
                    10,
                    False,
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
                    old_operator_compliance_report_version.id,
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
                    new_operator_compliance_report_version.id,
                ),
            )
            return cursor.rowcount

        def delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_report_version"
                   WHERE id = %s
                """,
                (old_operator_compliance_report_version.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_report_version"
                   WHERE id = %s
                """,
                (new_operator_compliance_report_version.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceReportVersion,
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

    def test_compliance_report_version_rls_cas_users(self):
        operator = make_recipe('registration.tests.utils.operator')
        operation = make_recipe('registration.tests.utils.operation', operator=operator)
        report = make_recipe('reporting.tests.utils.report', operation=operation)
        compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=report)
        make_recipe('compliance.tests.utils.compliance_report_version', id=88, compliance_report=compliance_report)

        def select_function(cursor):
            assert ComplianceReportVersion.objects.count() == 1

        assert_policies_for_cas_roles(
            ComplianceReportVersion,
            select_function=select_function,
        )
