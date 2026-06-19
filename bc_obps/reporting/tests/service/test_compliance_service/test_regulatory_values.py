from datetime import date, datetime
from django.utils import timezone
from decimal import Decimal
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.naics_regulatory_value import NaicsRegulatoryValue
from reporting.models.report_version import ReportVersion
from reporting.service.compliance_service.regulatory_values import (
    RegulatoryValuesOverride,
    get_industry_regulatory_values,
    get_product_regulatory_values_override,
)
from service.report_service import ReportService


class TestRegulatoryValues(TestCase):
    """
    Test suite for the regulatory values portion of the compliance service
    """

    def test_get_industry_regulatory_values(self):
        ## SETUP ##
        # Create report version records with recipes
        # and associated report operations with different NAICS codes
        report_version_1 = make_recipe(
            "reporting.tests.utils.report_version",
            report__reporting_year_id=2024,
        )
        make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version_1,
            naics_code_id=1,  # 211110 Oil and gas extraction
        )
        report_version_2 = make_recipe(
            "reporting.tests.utils.report_version",
            report__reporting_year_id=2025,
        )
        make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version_2,
            naics_code_id=22,  # 325189 All other basic inorganic chemical manufacturing
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
            report__reporting_year_id=2024,
        )
        make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            naics_code_id=1,  # 211110 Oil and gas extraction
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
            report__reporting_year_id=2024,
        )
        # Create associated report operation with NAICS code to link the report version to the override
        make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            naics_code_id=override.naics_code_id,
        )
        overrides = get_product_regulatory_values_override(report_version, product.id)

        assert overrides == RegulatoryValuesOverride(Decimal("9.9900"), Decimal("9.0000"))

    def test_get_product_regulatory_values_override_returns_overridden_values_if_dates_dont_match(self):
        # Overlapping is not enough
        # The Naics override needs to apply through the entire reporting window
        report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__reporting_year__reporting_year=2100,
            report__reporting_year__reporting_window_start=timezone.make_aware(datetime(2101, 3, 19)),
            report__reporting_year__reporting_window_end=timezone.make_aware(datetime(2101, 3, 22)),
        )
        make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            naics_code_id=1,  # 211110 Oil and gas extraction
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

    def test_admin_naics_code_does_not_override_reports_naics_code(self):
        # The report's regulatory values should be determined by the NAICS code associated with the report operation, not by the NAICS code associated with the operation in admin
        OIL_GAS_NAICS_CODE_ID = 1  # 211110 Oil and gas extraction
        BASIC_CHEM_NAICS_CODE_ID = 22  # 325189 All other basic inorganic chemical manufacturing
        operation = make_recipe(
            "registration.tests.utils.operation",
            naics_code_id=OIL_GAS_NAICS_CODE_ID,
        )
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=operation.operator,
            start_date=timezone.make_aware(datetime(2023, 1, 1)),
            end_date=timezone.make_aware(datetime(2030, 1, 1)),
        )
        # create new report
        report_version_id = ReportService.create_report(
            operation.id,
            reporting_year=2024,
        )
        report_version = ReportVersion.objects.get(id=report_version_id)
        # update operation with different NAICS code in admin
        operation.naics_code_id = BASIC_CHEM_NAICS_CODE_ID
        operation.save()

        # Compare values from the service and directly from the DB
        regulatory_values_from_service = get_industry_regulatory_values(report_version)
        oil_gas_regulatory_values = NaicsRegulatoryValue.objects.get(
            naics_code_id=OIL_GAS_NAICS_CODE_ID,
            valid_from__lte=report_version.report.reporting_year.reporting_window_start,
            valid_to__gte=report_version.report.reporting_year.reporting_window_end,
        )
        basic_chem_regulatory_values = NaicsRegulatoryValue.objects.get(
            naics_code_id=BASIC_CHEM_NAICS_CODE_ID,
            valid_from__lte=report_version.report.reporting_year.reporting_window_start,
            valid_to__gte=report_version.report.reporting_year.reporting_window_end,
        )

        assert regulatory_values_from_service.reduction_factor == oil_gas_regulatory_values.reduction_factor
        assert regulatory_values_from_service.tightening_rate == oil_gas_regulatory_values.tightening_rate
        assert regulatory_values_from_service.reduction_factor != basic_chem_regulatory_values.reduction_factor
