from django.test import TestCase
from reporting.models import ReportComplianceSummary, ReportComplianceSummaryProduct, ReportEmission, ReportProduct
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

    def test_compliance_summary_2025_period(self):
        # Assertion values from compliance_class_manual_calcs.xlsx sheet 4
        build_data = ComplianceTestInfrastructure.reporting_year_2025()

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('123001.0577')
        assert result.reporting_only_emissions == Decimal('3000.05')
        assert result.emissions_attributable_for_compliance == Decimal('70000.2564')
        assert result.emissions_limit == Decimal('20492.7318')
        assert result.excess_emissions == Decimal('49507.5246')
        assert result.credited_emissions == 0

    def test_compliance_summary_with_unregulated_product(self):
        # Assertion values from compliance_class_manual_calcs.xlsx sheet 5
        build_data = ComplianceTestInfrastructure.unregulated_product()
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        assert result.emissions_attributable_for_reporting == Decimal('123001.0577')
        assert result.reporting_only_emissions == Decimal('5200.05')
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
