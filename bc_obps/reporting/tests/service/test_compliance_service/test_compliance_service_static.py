from django.test import TestCase
from decimal import Decimal
from reporting.service.compliance_service import ComplianceService
from model_bakery.baker import make_recipe


class TestComplianceSummaryService(TestCase):

    def test_get_emissions_attributable_for_reporting(self):
        ## SETUP ##
        # Create report_emission records with recipes
        report_emission_1 = make_recipe(
            "reporting.tests.utils.report_emission",
            json_data={"equivalentEmission": 100.0001},
        )
        report_emission_2 = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=report_emission_1.report_version,
            json_data={"equivalentEmission": 200.9988},
        )
        report_emission_3 = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=report_emission_1.report_version,
            json_data={"equivalentEmission": 300.05},
        )

        # Set emission categories for report_emission records
        # emission_category id 1 = Flaring, 3 = Industrial Process, 4 = On-site transportation, 12 = excluded non-biomass
        report_emission_1.emission_categories.set([1])
        report_emission_2.emission_categories.set([3])
        report_emission_3.emission_categories.set([4, 12])

        ## TESTS ##
        # Only basic should be counted, report_emission_3 should not be counted twice
        sum_for_testing = ComplianceService.get_emissions_attributable_for_reporting(
            report_emission_1.report_version_id
        )
        emission_sum = (
            Decimal(str(report_emission_1.json_data["equivalentEmission"]))
            + Decimal(str(report_emission_2.json_data["equivalentEmission"]))
            + Decimal(str(report_emission_3.json_data["equivalentEmission"]))
        )
        assert sum_for_testing == emission_sum

    def test_get_production_totals(self):
        ## SETUP ##
        report_product_1 = make_recipe(
            "reporting.tests.utils.report_product",
            annual_production=Decimal("10000"),
            production_data_apr_dec=Decimal("5000"),
        )
        report_product_2 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=report_product_1.report_version,
            annual_production=Decimal("100000"),
            production_data_apr_dec=Decimal("25000"),
        )
        report_product_3 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=report_product_1.report_version,
            annual_production=Decimal("200000"),
            production_data_apr_dec=Decimal("150000"),
        )

        ## TESTS ##
        sums_for_testing = ComplianceService.get_production_totals(report_product_1.report_version_id)
        annual_sum = (
            report_product_1.annual_production + report_product_2.annual_production + report_product_3.annual_production
        )
        apr_dec_sum = (
            report_product_1.production_data_apr_dec
            + report_product_2.production_data_apr_dec
            + report_product_3.production_data_apr_dec
        )

        assert sums_for_testing["annual_amount"] == annual_sum
        assert sums_for_testing["apr_dec"] == apr_dec_sum

    def test_get_report_product_aggregated_totals(self):
        ## SETUP ##
        report_product_1 = make_recipe(
            "reporting.tests.utils.report_product",
            annual_production=Decimal("10000.0001"),
            production_data_apr_dec=Decimal("5000.05"),
        )
        report_product_2 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=report_product_1.report_version,
            product=report_product_1.product,
            annual_production=Decimal("100000.003"),
            production_data_apr_dec=Decimal("25000.0002"),
        )
        report_product_3 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=report_product_1.report_version,
            annual_production=Decimal("200000.0091"),
            production_data_apr_dec=Decimal("150000.1234"),
        )
        report_product_4 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=report_product_1.report_version,
            product=report_product_3.product,
            annual_production=Decimal("400000.002"),
            production_data_apr_dec=Decimal("50000.321"),
        )

        ## TESTS ##
        product_1_2_aggregate_for_test = ComplianceService.get_report_product_aggregated_totals(
            report_product_1.report_version_id, report_product_1.product_id
        )
        product_3_4_aggregate_for_test = ComplianceService.get_report_product_aggregated_totals(
            report_product_3.report_version_id, report_product_3.product_id
        )

        assert (
            product_1_2_aggregate_for_test["annual_amount"]
            == report_product_1.annual_production + report_product_2.annual_production
        )
        assert (
            product_1_2_aggregate_for_test["apr_dec"]
            == report_product_1.production_data_apr_dec + report_product_2.production_data_apr_dec
        )

        assert (
            product_3_4_aggregate_for_test["annual_amount"]
            == report_product_3.annual_production + report_product_4.annual_production
        )
        assert (
            product_3_4_aggregate_for_test["apr_dec"]
            == report_product_3.production_data_apr_dec + report_product_4.production_data_apr_dec
        )

    def test_get_emission_limit(self):
        emission_limit_for_test = ComplianceService.calculate_product_emission_limit(
            pwaei=Decimal("0.5"),
            production_for_emission_limit=Decimal("20000"),
            allocated_industrial_process=Decimal("5000"),
            allocated_for_compliance=Decimal("20000"),
            tightening_rate=Decimal("0.1"),
            reduction_factor=Decimal("0.65"),
            compliance_period=2025,
            initial_compliance_period=2024,
        )

        # CALCULATION DEFINITION
        # product_emission_limit = (apr_dec_production * pwaei) * (
        #     reduction_factor
        #     - (
        #         (Decimal('1') - (allocated_industrial_process / allocated_for_compliance))
        #         * tightening_rate
        #         * (compliance_period - initial_compliance_period)
        #     )
        # )
        #  = (20000 * 0.5) * (0.65 - ((1 - (5000 / 20000)) * 0.1 * (2025-2024)))
        #  = 10000 * (0.65 - ((1 - 0.25)) * 0.1)
        #  = 10000 * (0.65 - 0.075)
        #  = 10000 * 0.575
        #  = 5750
        assert emission_limit_for_test == Decimal("5750")

    def test_get_emission_limit_handles_divide_by_zero(self):
        emission_limit_for_test = ComplianceService.calculate_product_emission_limit(
            pwaei=Decimal("0.5"),
            production_for_emission_limit=Decimal("20000"),
            allocated_industrial_process=Decimal("5000"),
            allocated_for_compliance=Decimal("0"),
            tightening_rate=Decimal("0.1"),
            reduction_factor=Decimal("0.65"),
            compliance_period=2025,
            initial_compliance_period=2024,
        )

        # CALCULATION DEFINITION
        # product_emission_limit = (apr_dec_production * pwaei) * (
        #     reduction_factor
        #     - (
        #         (Decimal('1') - (allocated_industrial_process / allocated_for_compliance))
        #         * tightening_rate
        #         * (compliance_period - initial_compliance_period)
        #     )
        # )
        #  = (20000 * 0.5) * (0.65 - ((1 - (5000 / 0)) * 0.1 * (2025-2024)))
        #  = 10000 * (0.65 - ((1)) * 0.1)
        #  = 10000 * (0.65 - 0.1)
        #  = 10000 * 0.55
        #  = 5500
        assert emission_limit_for_test == Decimal("5500")
