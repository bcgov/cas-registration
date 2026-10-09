from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportComplianceSummary
from model_bakery import baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from model_bakery.baker import make_recipe
from decimal import Decimal
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportComplianceSummaryModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        rv = baker.make_recipe('reporting.tests.utils.report_version')

        cls.test_object = ReportComplianceSummary.objects.create(
            report_version=rv,
            emissions_attributable_for_reporting=1000,
            reporting_only_emissions=500,
            emissions_attributable_for_compliance=500,
            emissions_limit=100,
            excess_emissions=400,
            credited_emissions=0,
            reduction_factor=Decimal("0.6500"),
            tightening_rate=Decimal("0.0100"),
            compliance_period=2024,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("emissions_attributable_for_reporting", "emissions attributable for reporting", None, None),
            ("reporting_only_emissions", "reporting only emissions", None, None),
            ("emissions_attributable_for_compliance", "emissions attributable for compliance", None, None),
            ("emissions_limit", "emissions limit", None, None),
            ("excess_emissions", "excess emissions", None, None),
            ("credited_emissions", "credited emissions", None, None),
            ("reduction_factor", "reduction factor", None, None),
            ("tightening_rate", "tightening rate", None, None),
            ("initial_compliance_period", "initial compliance period", None, None),
            ("compliance_period", "compliance period", None, None),
            (
                "report_compliance_summary_products",
                "report compliance summary product",
                None,
                0,
            ),
            ('compliance_report_version', 'compliance report version', None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_compliance_summary",
            "emissions_attributable_for_reporting",
            decimal_value_to_update=Decimal('444.0'),
        )


class ReportComplianceSummaryRlsTest(BaseTestCase):

    def test_report_compliance_summary_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup()

        # ReportComplianceSummary Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportComplianceSummary:immutable_report_version"):
            report_compliance_summary_2010_submitted = make_recipe(
                'reporting.tests.utils.report_compliance_summary', report_version=t.report_version_2010_submitted
            )
        report_compliance_summary_2010_draft = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_compliance_summary_2013_draft = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=t.report_version_2013_draft
        )

        # Additional report_version needed for insert test: 2012 - Within access bounds
        reporting_year_2012 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2012)
        report_2012 = make_recipe(
            'reporting.tests.utils.report',
            operation=t.report_version_2010_submitted.report.operation,
            operator=t.report_version_2010_submitted.report.operator,
            reporting_year=reporting_year_2012,
        )
        report_version_2012_draft = make_recipe(
            'reporting.tests.utils.report_version', report=report_2012, status='Draft'
        )

        def select_function(cursor):
            ReportComplianceSummary.objects.get(id=report_compliance_summary_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportComplianceSummary.objects.get(id=report_compliance_summary_2013_draft.id)

        def insert_function(cursor):
            ReportComplianceSummary.objects.create(
                report_version=report_version_2012_draft,
                emissions_attributable_for_reporting=Decimal('10.00'),
                reporting_only_emissions=Decimal('5.00'),
                emissions_attributable_for_compliance=Decimal('5.00'),
                excess_emissions=Decimal('5.00'),
                credited_emissions=Decimal('0.00'),
                emissions_limit=Decimal('5.00'),
                reduction_factor=Decimal('0.50'),
                tightening_rate=Decimal('1.00'),
                compliance_period=2025,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_compliance_summary"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_compliance_summary"
                    SET excess_emissions = %s
                    WHERE id = %s
                """,
                (Decimal(20.00), report_compliance_summary_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_compliance_summary"
                    SET excess_emissions = %s
                    WHERE id = %s
                """,
                (Decimal(20.00), report_compliance_summary_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_compliance_summary"
                    WHERE id = %s
                """,
                (report_compliance_summary_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_compliance_summary"
                    WHERE id in (%s,%s)
                """,
                (report_compliance_summary_2010_submitted.id, report_compliance_summary_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportComplianceSummary,
            t.approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_report_compliance_summary_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportComplianceSummary.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportComplianceSummary,
            select_function=select_function,
        )
