from common.tests.utils.helpers import BaseTestCase
import pytest
from django.core.exceptions import ValidationError
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_product import ReportProduct
from model_bakery.baker import make_recipe, make
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportProductModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")

        cls.test_object = make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility_report", "facility report", None, None),
            ("product", "product", None, None),
            ("annual_production", "annual production", None, None),
            ("production_data_jan_mar", "production data jan mar", None, None),
            ("production_data_apr_dec", "production data apr dec", None, None),
            ("production_methodology", "production methodology", 10000, None),
            (
                "production_methodology_description",
                "production methodology description",
                10000,
                None,
            ),
            (
                "storage_quantity_start_of_period",
                "storage quantity start of period",
                None,
                None,
            ),
            (
                "storage_quantity_end_of_period",
                "storage quantity end of period",
                None,
                None,
            ),
            ("quantity_sold_during_period", "quantity sold during period", None, None),
            (
                "quantity_throughput_during_period",
                "quantity throughput during period",
                None,
                None,
            ),
            (
                "reportproductemissionallocation_records",
                "report product emission allocation",
                None,
                0,
            ),
        ]

    def test_unique_report_product_per_product_and_facility_report(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")

        make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )
        with pytest.raises(
            ValidationError,
            match="Report product with this Facility report and Product already exists.",
        ):
            make(
                ReportProduct,
                report_version=facility_report.report_version,
                facility_report=facility_report,
                product=product,
            )

    def test_allow_null_description_if_methodology_is_not_other(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")

        with pytest.raises(
            ValidationError,
            match="A value for production_methodology_description should be provided if the production_methodology is 'other'",
        ):
            make(
                ReportProduct,
                report_version=facility_report.report_version,
                facility_report=facility_report,
                product=product,
                production_methodology=ReportProduct.ProductionMethodologyChoices.OTHER,
            )

        # This should not raise
        make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
            production_methodology=ReportProduct.ProductionMethodologyChoices.OBPS_CALCULATOR,
        )

    def test_cant_save_a_report_product_with_missing_apr_dec_data_for_2024(self):
        facility_report_2024 = make_recipe(
            "reporting.tests.utils.facility_report", report_version__report__reporting_year_id=2024
        )
        facility_report = make_recipe(
            "reporting.tests.utils.facility_report", report_version__report__reporting_year__reporting_year=2023
        )

        product = make_recipe("registration.tests.utils.regulated_product")

        with pytest.raises(
            ValidationError, match='Apr-Dec production data needs to be reported for reporting year 2024.'
        ):
            make(
                ReportProduct,
                report_version=facility_report_2024.report_version,
                facility_report=facility_report_2024,
                production_data_apr_dec=None,
                product=product,
            )

        make(
            ReportProduct,
            report_version=facility_report_2024.report_version,
            facility_report=facility_report_2024,
            production_data_apr_dec=1234,
            product=product,
        )

        # None value should be allowed for a reporting year not 2024
        make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            production_data_apr_dec=None,
            product=product,
        )

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_product")


class ReportProductRlsTest(BaseTestCase):

    def test_report_product_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='facility_report')

        # ReportProduct Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportProduct:immutable_report_version"):
            report_product_2010_submitted = make_recipe(
                'reporting.tests.utils.report_product',
                report_version=t.report_version_2010_submitted,
            )
        report_product_2010_draft = make_recipe(
            'reporting.tests.utils.report_product', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_product_2013_draft = make_recipe(
            'reporting.tests.utils.report_product', report_version=t.report_version_2013_draft
        )

        test_product = make_recipe('registration.tests.utils.regulated_product')

        def select_function(cursor):
            ReportProduct.objects.get(id=report_product_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportProduct.objects.get(id=report_product_2013_draft.id)

        def insert_function(cursor):
            ReportProduct.objects.create(
                report_version=t.report_version_2010_draft,
                facility_report=t.parent_object_2010_draft,
                product=test_product,
                annual_production=20,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_product"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_product"
                    SET annual_production = %s
                    WHERE id = %s
                """,
                (30, report_product_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_product"
                    SET annual_production = %s
                    WHERE id = %s
                """,
                (40, report_product_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_product"
                    WHERE id = %s
                """,
                (report_product_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_product"
                    WHERE id in (%s,%s)
                """,
                (report_product_2010_submitted.id, report_product_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportProduct,
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

    def test_report_product_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_product",
        )
        make_recipe(
            "reporting.tests.utils.report_product",
        )

        def select_function(cursor):
            assert ReportProduct.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportProduct,
            select_function=select_function,
        )
