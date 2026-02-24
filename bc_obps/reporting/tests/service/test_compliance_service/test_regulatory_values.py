from datetime import date
from decimal import Decimal
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.service.compliance_service.regulatory_values import (
    RegulatoryValuesOverride,
    get_industry_regulatory_values,
    get_product_regulatory_values_override,
)


class TestRegulatoryValues(TestCase):
    """
    Test suite for the regulatory values portion of the compliance service
    """

    def test_get_industry_regulatory_values(self):
        ## SETUP ##
        # Create report version records with recipes
        report_version_1 = make_recipe(
            "reporting.tests.utils.report_version",
            report__operation__naics_code_id=1,  # 211110 Oil and gas extraction
            report__reporting_year_id=2024,
        )
        report_version_2 = make_recipe(
            "reporting.tests.utils.report_version",
            report__operation__naics_code_id=22,  # 325189 All other basic inorganic chemical manufacturing
            report__reporting_year_id=2025,
        )

        ## TESTS ##
        # Test service function returns correct values (returns tuple of RegulatoryValues, reduction_factor, tightening_rate)
        regulatory_values_1 = get_industry_regulatory_values(report_version_1)
        regulatory_values_2 = get_industry_regulatory_values(report_version_2)

        # Test reduction_factor and tightening_rate are returned correctly
        assert regulatory_values_1.reduction_factor == Decimal("0.6500")
        assert regulatory_values_1.tightening_rate == Decimal("0.0100")
        assert regulatory_values_2.reduction_factor == Decimal("0.9000")
        assert regulatory_values_2.tightening_rate == Decimal("0.0100")

        # Test RegulatoryValues object contains period information
        assert regulatory_values_1.initial_compliance_period == 2024
        assert regulatory_values_1.compliance_period == 2024
        assert regulatory_values_2.initial_compliance_period == 2024
        assert regulatory_values_2.compliance_period == 2025

    def test_get_product_regulatory_values_override_returns_null_object_if_no_override(self):
        report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__operation__naics_code_id=1,  # 211110 Oil and gas extraction
            report__reporting_year_id=2024,
        )
        report_product = make_recipe("registration.tests.utils.regulated_product")

        overrides = get_product_regulatory_values_override(report_version, report_product.id)

        assert overrides.reduction_factor_override is None
        assert overrides.tightening_rate_override is None

    def test_get_product_regulatory_values_override_returns_overridden_values(self):
        product = make_recipe("registration.tests.utils.regulated_product", name='Test Product')
        override = make_recipe(
            "reporting.tests.utils.naics_regulatory_override",
            regulated_product=product,
            reduction_factor=9.99,
            tightening_rate=9,
        )
        report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__operation__naics_code_id=override.naics_code_id,
            report__reporting_year_id=2024,
        )

        overrides = get_product_regulatory_values_override(report_version, product.id)

        assert overrides == RegulatoryValuesOverride(Decimal("9.9900"), Decimal("9.0000"))

    def test_get_product_regulatory_values_override_returns_overridden_values_if_dates_dont_match(self):
        # Overlapping is not enough
        # The Naics override needs to apply through the entire reporting window
        report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__operation__naics_code_id=1,  # 211110 Oil and gas extraction
            report__reporting_year__reporting_year=2100,
            report__reporting_year__reporting_window_start=date(2101, 3, 19),
            report__reporting_year__reporting_window_end=date(2101, 3, 22),
        )
        product = make_recipe("registration.tests.utils.regulated_product", name='Test Product')
        make_recipe(
            "reporting.tests.utils.naics_regulatory_override",
            regulated_product=product,
            tightening_rate=6,
            reduction_factor=6.6,
            valid_from=date(2101, 3, 20),
            valid_to=date(2101, 4, 20),
        )

        overrides = get_product_regulatory_values_override(report_version, product.id)

        assert overrides == RegulatoryValuesOverride(None, None)
