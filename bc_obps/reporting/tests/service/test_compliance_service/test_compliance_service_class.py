from django.test import TestCase
from reporting.models import (
    ReportComplianceSummary,
    ReportComplianceSummaryProduct,
    ReportEmission,
    ReportProduct,
    EmissionCategory,
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

        report_version_id = build_2024.report_version_1.id
        basic_category_ids = list(EmissionCategory.objects.filter(category_type="basic").values_list("id", flat=True))

        for prod_2024 in result_2024.products:
            prod_2025 = next((p for p in result_2025.products if p.product_id == prod_2024.product_id), None)
            self.assertIsNotNone(prod_2025, f"Product {prod_2024.product_id} missing in 2025 result")

            # compute full-year allocated (basic - reporting-only)
            basic_allocated = ComplianceService.get_allocated_emissions_by_report_product_emission_category(
                report_version_id, prod_2024.product_id, basic_category_ids
            )
            reporting_only = ComplianceService.get_reporting_only_allocated(report_version_id, prod_2024.product_id)
            allocated_full = Decimal(basic_allocated) - Decimal(reporting_only)

            # production totals
            totals = ComplianceService.get_report_product_aggregated_totals(report_version_id, prod_2024.product_id)
            annual_amount = Decimal(totals.get("annual_amount") or 0)
            apr_dec_amount = Decimal(totals.get("apr_dec") or 0)

            # expected values for 2024 (Apr-Dec scaling if annual_amount > 0)
            if annual_amount == 0:
                expected_2024 = Decimal("0.0000")
            else:
                expected_2024 = (allocated_full / annual_amount) * apr_dec_amount
                expected_2024 = expected_2024.quantize(Decimal("0.0001"))

            # expected for 2025 is full-year allocated
            expected_2025 = allocated_full.quantize(Decimal("0.0001"))

            self.assertEqual(Decimal(prod_2024.allocated_compliance_emissions), expected_2024)
            self.assertEqual(Decimal(prod_2025.allocated_compliance_emissions), expected_2025)

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
