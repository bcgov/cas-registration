from common.tests.utils.helpers import BaseTestCase
import pytest
from django.core.exceptions import ValidationError
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_product import ReportProduct
from model_bakery.baker import make_recipe, make
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


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
