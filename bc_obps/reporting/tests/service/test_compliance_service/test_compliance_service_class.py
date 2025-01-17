from django.test import TestCase
from reporting.service.compliance_service import ComplianceService
from infrastructure import ComplianceTestInfrastructure
from decimal import Decimal


class TestComplianceSummaryServiceClass(TestCase):
    def test_compliance_summary_only_flaring_single_product(self):
        build_data = ComplianceTestInfrastructure.build()
        ComplianceTestInfrastructure.pare_data_single_product_flaring()
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)

        print('### RESULT ###')
        print(result.__dict__)
        print('### REG VALUES ###')
        print(result.regulatory_values.__dict__)
        print('### PRODUCTS ###')
        for p in result.products:
            print(p.__dict__)
        assert result.emissions_attributable_for_reporting == Decimal('10000.0001')
        assert result.emissions_limit == Decimal('159.25')
        assert result.excess_emissions == Decimal('4840.75')
        assert result.credited_emissions == 0

    def test_with_industrial_process_emissions(self):
        build_data = ComplianceTestInfrastructure.build()
        ComplianceTestInfrastructure.pare_data_remove_reporting_only()
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
        print('### RESULT ###')
        print(result.__dict__)
        print(result.regulatory_values.__dict__)
        print('### PRODUCTS ###')
        for p in result.products:
            print(p.__dict__)

        assert result.emissions_attributable_for_reporting == Decimal('120001.0077')
        assert result.reporting_only_emissions == 0
        assert result.emissions_attributable_for_compliance == Decimal('70000.2564')
        assert result.emissions_limit == Decimal('20767.5000')
        assert result.excess_emissions == Decimal('49232.7564')
        assert result.credited_emissions == 0

    def test_compliance_summary_with_all_data(self):
        build_data = ComplianceTestInfrastructure.build()
        ## TESTS ##
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
        print('### RESULT ###')
        print(result.__dict__)
        print('### REG VALUES ###')
        print(result.regulatory_values.__dict__)
        print('### PRODUCTS ###')
        for p in result.products:
            print(p.__dict__)

        assert result.emissions_attributable_for_reporting == Decimal('123001.0577')
        assert result.reporting_only_emissions == Decimal('3000.05')
        assert result.emissions_attributable_for_compliance == Decimal('70000.2564')
        assert result.emissions_limit == Decimal('20767.5000')
        assert result.excess_emissions == Decimal('49232.7564')
        assert result.credited_emissions == 0

    def test_compliance_summary_2025_period(self):
        build_data = ComplianceTestInfrastructure.build()
        ComplianceTestInfrastructure.reporting_year_2025()
        ## TESTS ##
        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
        print('### RESULT ###')
        print(result.__dict__)
        print('### REG VALUES ###')
        print(result.regulatory_values.__dict__)
        print('### PRODUCTS ###')
        for p in result.products:
            print(p.__dict__)

        assert result.emissions_attributable_for_reporting == Decimal('123001.0577')
        assert result.reporting_only_emissions == Decimal('3000.05')
        assert result.emissions_attributable_for_compliance == Decimal('70000.2564')
        assert result.emissions_limit == Decimal('20492.7318')
        assert result.excess_emissions == Decimal('49507.5246')
        assert result.credited_emissions == 0
