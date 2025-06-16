from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
from django.core.exceptions import ValidationError
from registration.models import facility
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report import Report
from reporting.models.report_product import ReportProduct
from model_bakery.baker import make_recipe, make
from reporting.tests.utils.bakers import report_baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.rls_test_recipe import ReportRlsSetup
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


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

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_product")

class ReportProductRlsTest(BaseTestCase):

    def test_report_product_rls_industry_user(self):

        test = ReportRlsSetup()
        product = make_recipe("registration.tests.utils.regulated_product")
        test_report_product = make(
            ReportProduct,
            report_version=test.report_version,
            facility_report=test.facility_report,
            product=product,
        )
        number_of_accesible_records = ReportProduct.objects.filter(
            report_version=test.report_version,
        ).count()
        random = ReportRlsSetup()
        random_product = make_recipe("registration.tests.utils.regulated_product")
        random_report_product = make(
            ReportProduct,
            report_version=random.report_version,
            facility_report=random.facility_report,
            product=random_product,
        )
        number_of_total_records = ReportProduct.objects.count()

        def select_function(cursor):
            assert ReportProduct.objects.count() < number_of_total_records
            assert ReportProduct.objects.count() == number_of_accesible_records
            assert ReportProduct.objects.filter(
                facility_report=test.facility_report
            ).count() == number_of_accesible_records
            # Ensure the random report product cannot be selected
            assert ReportProduct.objects.filter(
                facility_report=random.facility_report
            ).count() == 0

        def insert_function(cursor):
            new_report_product = make(
                ReportProduct,
                report_version=test.report_version,
                facility_report=test.facility_report,
                product=random_product,
            )
            number_of_accesible_records_after_insert = number_of_accesible_records + 1
            assert ReportProduct.objects.count() == number_of_accesible_records_after_insert
            assert new_report_product.id is not None
            # Attempt to insert a report product for a report that the user is not an operator for
            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "report_product'
            ):
                cursor.execute("""
                    INSERT INTO "erc"."report_product" (
                        "report_version_id", "facility_report_id", "product_id",
                        "annual_production", "production_data_apr_dec",
                        "production_methodology", "production_methodology_description"
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)


                """,
                    (random.report_version.id, random.facility_report.id, product.id,
                     1000, 500, ReportProduct.ProductionMethodologyChoices.OBPS_CALCULATOR, None)
                )
            # Ensure the count remains the same after an unsuccessful insert
            # assert ReportProduct.objects.count() == number_of_accesible_records_after_insert

        def update_function(cursor):
            test_report_product.annual_production = 2000
            test_report_product.save()
            # Assert that the record was updated correctly
            assert ReportProduct.objects.get(id=test_report_product.id).annual_production == 2000

            # Attempt to update a report product that the user should not have access to
            cursor.execute("""
                UPDATE "erc"."report_product"
                SET "annual_production" = %s
                WHERE "report_version_id" = %s AND "facility_report_id" = %s
            """, (3000, random.report_version.id, random.facility_report.id))
            assert cursor.rowcount == 0  # No rows should be updated

        def delete_function(cursor):
            assert ReportProduct.objects.filter(
                facility_report=test.facility_report
            ).count() == number_of_accesible_records
            # Delete the report product for the approved user operator
            number_of_deleted_report_products, _ = test_report_product.delete()

            assert number_of_deleted_report_products > 0
            assert ReportProduct.objects.filter(
                facility_report=test.facility_report
            ).count() == number_of_accesible_records - number_of_deleted_report_products
            # Attempt to delete a report product that the user should not have access to
            number_of_deleted_report_products, _ = random_report_product.delete()
            assert number_of_deleted_report_products == 0

        test_policies_for_industry_user(
            ReportProduct,
            test.approved_user_operator.user,
            select_function,
            insert_function,
            update_function,
            delete_function,
        )

    def test_report_product_rls_cas_user(self):
        test_quantity = 5
        for i in range(test_quantity):
            facility_report = make_recipe("reporting.tests.utils.facility_report")
            product = make_recipe("registration.tests.utils.regulated_product")
            make(
                ReportProduct,
                report_version=facility_report.report_version,
                facility_report=facility_report,
                product=product,
            )
        # Ensure the count is as expected
        assert ReportProduct.objects.count() == test_quantity

        def select_function(cursor, i):
            assert ReportProduct.objects.count() == test_quantity

        test_policies_for_cas_roles(
            ReportProduct,
            select_function=select_function,
        )
