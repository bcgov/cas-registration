from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportComplianceSummaryProduct
from model_bakery import baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from decimal import Decimal
from model_bakery.baker import make_recipe
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportComplianceSummaryModelProductTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        rv = baker.make_recipe('reporting.tests.utils.report_version')
        rcs = baker.make_recipe('reporting.tests.utils.report_compliance_summary')
        p = baker.make_recipe('registration.tests.utils.regulated_product')

        cls.test_object = ReportComplianceSummaryProduct.objects.create(
            report_version=rv,
            report_compliance_summary=rcs,
            product=p,
            annual_production=100,
            jan_mar_production=0,
            apr_dec_production=50,
            emission_intensity=0.5,
            allocated_industrial_process_emissions=25,
            allocated_compliance_emissions=50,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("report_compliance_summary", "report compliance summary", None, None),
            ("product", "product", None, None),
            ("annual_production", "annual production", None, None),
            ("jan_mar_production", "jan mar production", None, None),
            ("apr_dec_production", "apr dec production", None, None),
            ("emission_intensity", "emission intensity", None, None),
            ("allocated_industrial_process_emissions", "allocated industrial process emissions", None, None),
            ("allocated_compliance_emissions", "allocated compliance emissions", None, None),
            ("reduction_factor_override", "reduction factor override", None, None),
            ("tightening_rate_override", "tightening rate override", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_compliance_summary_product",
            "annual_production",
            decimal_value_to_update=Decimal('444.0'),
        )


class ReportComplianceSummarProductyRlsTest(BaseTestCase):

    def test_report_compliance_summary_product_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='report_compliance_summary')

        # ReportComplianceSummaryProduct Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportComplianceSummaryProduct:immutable_report_version"):
            report_compliance_summary_product_2010_submitted = make_recipe(
                'reporting.tests.utils.report_compliance_summary_product',
                report_version=t.report_version_2010_submitted,
            )
        report_compliance_summary_product_2010_draft = make_recipe(
            'reporting.tests.utils.report_compliance_summary_product', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_compliance_summary_product_2013_draft = make_recipe(
            'reporting.tests.utils.report_compliance_summary_product', report_version=t.report_version_2013_draft
        )

        regulated_product = make_recipe('registration.tests.utils.regulated_product')

        # Additional report_version needed for insert test: 2012 - Within access bounds
        # reporting_year_2012 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2012)
        # report_2012 = make_recipe(
        #     'reporting.tests.utils.report',
        #     operation=t.report_version_2010_submitted.report.operation,
        #     operator=t.report_version_2010_submitted.report.operator,
        #     reporting_year=reporting_year_2012,
        # )
        # report_version_2012_draft = make_recipe(
        #     'reporting.tests.utils.report_version', report=report_2012, status='Draft'
        # )

        def select_function(cursor):
            ReportComplianceSummaryProduct.objects.get(id=report_compliance_summary_product_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportComplianceSummaryProduct.objects.get(id=report_compliance_summary_product_2013_draft.id)

        def insert_function(cursor):
            ReportComplianceSummaryProduct.objects.create(
                report_version=t.report_version_2010_draft,
                report_compliance_summary=t.parent_object_2010_draft,
                product=regulated_product,
                annual_production=Decimal('100.00'),
                apr_dec_production=Decimal('100.00'),
                emission_intensity=Decimal('1.00'),
                allocated_industrial_process_emissions=Decimal('0.00'),
                allocated_compliance_emissions=Decimal('0.00'),
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_compliance_summary_product"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_compliance_summary_product"
                    SET allocated_compliance_emissions = %s
                    WHERE id = %s
                """,
                (Decimal(20.00), report_compliance_summary_product_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_compliance_summary_product"
                    SET allocated_compliance_emissions = %s
                    WHERE id = %s
                """,
                (Decimal(20.00), report_compliance_summary_product_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_compliance_summary_product"
                    WHERE id = %s
                """,
                (report_compliance_summary_product_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_compliance_summary_product"
                    WHERE id in (%s,%s)
                """,
                (report_compliance_summary_product_2010_submitted.id, report_compliance_summary_product_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportComplianceSummaryProduct,
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
            "reporting.tests.utils.report_compliance_summary_product",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportComplianceSummaryProduct.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportComplianceSummaryProduct,
            select_function=select_function,
        )
