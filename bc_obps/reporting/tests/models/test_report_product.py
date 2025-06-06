from common.tests.utils.helpers import BaseTestCase
from django.db import connection
import pytest
from django.core.exceptions import ValidationError
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_product import ReportProduct
from model_bakery.baker import make_recipe, make
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from rls.middleware.rls import RlsMiddleware
from rls.tests.helpers import test_policies_for_industry_user
import test


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

    def test_report_product_rls_industry_user_success(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        operation = make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        facility_report = make_recipe("reporting.tests.utils.facility_report", facility__operation=operation)
        product = make_recipe("registration.tests.utils.regulated_product")
        report_product = make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )
        random_operation = make_recipe('registration.tests.utils.operation')
        random_facility_report = make_recipe("reporting.tests.utils.facility_report", facility__operation=random_operation)
        random_product = make_recipe("registration.tests.utils.regulated_product")
        random_report_product = make(
            ReportProduct,
            report_version=random_facility_report.report_version,
            facility_report=random_facility_report,
            product=random_product,
        )
        # confirm two documents were created
        assert ReportProduct.objects.count() == 2

        # with connection.cursor() as cursor:
        #     RlsMiddleware._set_user_guid_and_role(cursor, approved_user_operator.user)
        #     assert ReportProduct.objects.count() == 1
        def select_function(cursor):
            assert ReportProduct.objects.count() == 1

        test_policies_for_industry_user(ReportProduct, approved_user_operator.user, select_function=select_function)
