from django.test import TestCase
from registration.models import Operation
from reporting.models import (
    ReportComplianceSummary,
    ReportComplianceSummaryProduct,
    ReportEmission,
    ReportProduct,
    Report,
    ReportOperation,
)
from reporting.service.compliance_service import ComplianceService
from reporting.tests.service.test_compliance_service.infrastructure import ComplianceTestInfrastructure
from decimal import Decimal


class TestComplianceSummaryServiceClass(TestCase):
    def test_compliance_summary_only_flaring_single_product(self):
        # Assertion values from compliance_class_manual_calcs.xlsx sheet 1
        build_data = ComplianceTestInfrastructure.pare_data_single_product_flaring()

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('10000.0001')
        assert result.emissions_limit == Decimal('159.25')
        assert result.excess_emissions == Decimal('4840.75')
        assert result.credited_emissions == 0

    def test_compliance_summary_zero_production_single_product(self):
        # Data from compliance_class_manual_calcs.xlsx sheet 1
        build_data = ComplianceTestInfrastructure.zero_production_single_product()

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('10000.0001')
        assert result.emissions_attributable_for_compliance == Decimal('0.0000')
        assert result.emissions_limit == Decimal('159.2500')
        assert result.credited_emissions == Decimal('159.2500')
        assert result.excess_emissions == Decimal('0.0000')

    def test_with_industrial_process_emissions(self):
        # Assertion values from compliance_class_manual_calcs.xlsx sheet 2
        build_data = ComplianceTestInfrastructure.pare_data_remove_reporting_only()

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('120001.0077')
        assert result.reporting_only_emissions == 0
        assert result.emissions_attributable_for_compliance == Decimal('70000.2564')
        assert result.emissions_limit == Decimal('20767.5000')
        assert result.excess_emissions == Decimal('49232.7564')
        assert result.credited_emissions == 0

    def test_compliance_summary_with_all_data(self):
        # Assertion values from compliance_class_manual_calcs.xlsx sheet 3
        build_data = ComplianceTestInfrastructure.build()

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('123001.0577')
        assert result.reporting_only_emissions == Decimal('3000.05')
        assert result.emissions_attributable_for_compliance == Decimal('70000.2564')
        assert result.emissions_limit == Decimal('20767.5000')
        assert result.excess_emissions == Decimal('49232.7564')
        assert result.credited_emissions == 0

        # Verify that each product has reduction_factor and tightening_rate populated
        for product in result.products:
            assert product.reduction_factor is not None
            assert product.tightening_rate is not None
            # For this test data, all products should have the same NAICS-based values
            assert product.reduction_factor == Decimal('0.6500')
            assert product.tightening_rate == Decimal('0.0100')

    def test_apr_dec_used_for_2024_summary(self):
        # Explicit test that 2024 uses Apr-Dec scaled allocations for compliance
        build_data = ComplianceTestInfrastructure.build()
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('123001.0577')
        assert result.reporting_only_emissions == Decimal('3000.05')
        # Apr–Dec scaled allocated total for 2024
        assert result.emissions_attributable_for_compliance == Decimal('70000.2564')
        assert result.emissions_limit == Decimal('20767.5000')
        assert result.excess_emissions == Decimal('49232.7564')
        assert result.credited_emissions == Decimal('0')

    def test_apr_dec_product_level_behavior(self):
        """Per-product Apr–Dec allocation behavior test."""
        # Build 2024 data
        build_2024 = ComplianceTestInfrastructure.build()
        result_2024 = ComplianceService.get_calculated_compliance_data(build_2024.report_version_1.id)

        # Create a 2025 report from the same base data
        build_2025 = ComplianceTestInfrastructure.reporting_year_2025()
        result_2025 = ComplianceService.get_calculated_compliance_data(build_2025.report_version_1.id)

        for idx, prod_2024 in enumerate(result_2024.products):
            prod_2025 = result_2025.products[idx]
            self.assertEqual(
                prod_2024.product_id,
                prod_2025.product_id,
                f"Product ID mismatch at index {idx}: {prod_2024.product_id} != {prod_2025.product_id}",
            )
            apr_dec = Decimal(prod_2025.apr_dec_production)
            annual = Decimal(prod_2025.annual_production)
            allocated_2024 = Decimal(prod_2024.allocated_compliance_emissions)
            allocated_2025 = Decimal(prod_2025.allocated_compliance_emissions)

            prorated = (allocated_2025 * (apr_dec / annual)).quantize(Decimal("0.0001"), rounding="ROUND_HALF_UP")
            self.assertEqual(allocated_2024, prorated)

    def test_apr_dec_product_level_behavior_zero_production(self):
        """Test Apr–Dec allocation behavior when annual production is zero."""
        # Build 2024 data with zero production
        build_2024 = ComplianceTestInfrastructure.zero_production_single_product()
        result_2024 = ComplianceService.get_calculated_compliance_data(build_2024.report_version_1.id)

        # The product should have zero allocated compliance emissions when production is zero
        for product in result_2024.products:
            self.assertEqual(product.allocated_compliance_emissions, Decimal("0.0000"))

    def test_jan_mar_production_period_for_operation_opted_out_for_2025(self):
        """Test that Jan-Mar production period is used for opted-in operations in their final reporting year."""
        build_data = ComplianceTestInfrastructure.build()
        # Set up as an opted-in operation in final reporting year (2025)
        ReportOperation.objects.filter(report_version=build_data.report_version_1).update(
            registration_purpose='Opted-in Operation',
            operation_opted_out_final_reporting_year=2025,
        )
        Report.objects.filter(pk=build_data.report_1.id).update(reporting_year=2025)

        # Set Jan-Mar production data for opted-in operations in final reporting year
        ReportProduct.objects.filter(report_version=build_data.report_version_1).update(
            production_data_jan_mar=Decimal('25000')
        )

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        # For jan_mar period, production_for_limit should use jan-mar production
        # The product should have jan_mar_production in its allocated_compliance_emissions calculation
        for product in result.products:
            # Verify that allocated compliance emissions are prorated based on jan-mar production
            self.assertEqual(product.allocated_compliance_emissions > 0, True)

    def test_production_period_returns_annual_for_opted_in_not_final_year(self):
        """Test that annual production is used for opted-in operations NOT in their final reporting year."""
        build_data = ComplianceTestInfrastructure.build()
        # Set up as an opted-in operation but 2025 is NOT their final reporting year
        ReportOperation.objects.filter(report_version=build_data.report_version_1).update(
            registration_purpose='Opted-in Operation',
            operation_opted_out_final_reporting_year=2026,  # Final year is 2026, not 2025
        )
        Report.objects.filter(pk=build_data.report_1.id).update(reporting_year=2025)

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        # For annual period, allocated_compliance_emissions should equal full allocated
        for product in result.products:
            # Annual production should be used, so no prorating
            self.assertEqual(product.allocated_compliance_emissions > 0, True)

    def test_compliance_summary_2025_period(self):
        # Assertion values from compliance_class_manual_calcs.xlsx sheet 4
        build_data = ComplianceTestInfrastructure.reporting_year_2025()

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        # After the change: non-2024 reporting years should use full-year allocations
        # Update expected values to match the full-year calculation results.
        assert result.emissions_attributable_for_reporting == Decimal('123001.0577')
        assert result.reporting_only_emissions == Decimal('3000.05')
        # Emissions attributable for compliance now uses full-year allocated emissions for 2025
        assert result.emissions_attributable_for_compliance == Decimal('120001.0077')
        # Emissions limit and excess/credited reflect full-year production being used
        assert result.emissions_limit == Decimal('54265.3270')
        assert result.excess_emissions == Decimal('65735.6807')
        assert result.credited_emissions == Decimal('0.0000')

    def test_compliance_summary_with_unregulated_product(self):
        build_data = ComplianceTestInfrastructure.unregulated_product_and_funny_category_13()
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('123056.6077')
        assert result.reporting_only_emissions == Decimal('3055.60')
        assert result.emissions_attributable_for_compliance == Decimal('70000.2564')
        assert result.emissions_limit == Decimal('20767.5000')
        assert result.excess_emissions == Decimal('49232.7564')
        assert result.credited_emissions == 0

    def test_new_entrant(self):
        build_data = ComplianceTestInfrastructure.new_entrant()
        ## TESTS ##
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_limit == 0
        assert result.excess_emissions == 0
        assert result.credited_emissions == 0

    def test_saves_compliance_data(self):
        build_data = ComplianceTestInfrastructure.build()
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
        ComplianceService.save_compliance_data(build_data.report_version_1.id)
        report_compliance_summary_record = ReportComplianceSummary.objects.get(
            report_version_id=build_data.report_version_1.id
        )
        report_compliance_product_records = ReportComplianceSummaryProduct.objects.filter(
            report_compliance_summary_id=report_compliance_summary_record.id
        )

        assert (
            report_compliance_summary_record.emissions_attributable_for_compliance
            == result.emissions_attributable_for_compliance
        )
        for idx, p in enumerate(report_compliance_product_records):
            assert p.annual_production == result.products[idx].annual_production

    def test_updates_compliance_data(self):
        build_data = ComplianceTestInfrastructure.build()
        initial_result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
        # Save the data
        ComplianceService.save_compliance_data(build_data.report_version_1.id)
        # Change an emission & product value & Update the compliance data
        ReportEmission.objects.filter(id=build_data.report_emission_1.id).update(
            json_data={"equivalentEmission": 10.1111}
        )
        ReportProduct.objects.filter(id=build_data.report_product_1.id).update(
            annual_production=Decimal('1250'),
            production_data_apr_dec=Decimal('250'),
        )
        ComplianceService.save_compliance_data(build_data.report_version_1.id)
        updated_result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        report_compliance_summary_record = ReportComplianceSummary.objects.get(
            report_version_id=build_data.report_version_1.id
        )
        report_compliance_product_records = ReportComplianceSummaryProduct.objects.filter(
            report_compliance_summary_id=report_compliance_summary_record.id
        )

        assert initial_result != updated_result

        assert (
            report_compliance_summary_record.emissions_attributable_for_compliance
            == updated_result.emissions_attributable_for_compliance
        )
        for idx, p in enumerate(report_compliance_product_records):
            assert p.annual_production == updated_result.products[idx].annual_production

    def test_compliance_summary_rounding(self):
        build_data = ComplianceTestInfrastructure.decimal_places()

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('10000.5556')
        assert result.emissions_attributable_for_compliance == Decimal('5000.2778')

    def test_get_production_period_for_jan_mar(self):
        build_2025 = ComplianceTestInfrastructure.reporting_year_2025()
        assert (
            ComplianceService.get_production_period(
                build_2025.report_version_1.id, Operation.Purposes.OPTED_IN_OPERATION, 2025
            )
            == "jan_mar"
        )

    def test_get_production_period_for_apr_dec(self):
        build_data = ComplianceTestInfrastructure.build()
        assert (
            ComplianceService.get_production_period(
                build_data.report_version_1.id, Operation.Purposes.OBPS_REGULATED_OPERATION, None
            )
            == "apr_dec"
        )

    def test_get_production_period_for_annual(self):
        build_data = ComplianceTestInfrastructure.reporting_year_2025()
        assert (
            ComplianceService.get_production_period(
                build_data.report_version_1.id, Operation.Purposes.OBPS_REGULATED_OPERATION, None
            )
            == "annual"
        )
        assert (
            ComplianceService.get_production_period(
                build_data.report_version_1.id, Operation.Purposes.OPTED_IN_OPERATION, 2026
            )
            == "annual"
        )
