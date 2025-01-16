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
        # assert result.emissions_attributable_for_compliance == Decimal('5000.0001')
        assert result.emissions_limit == Decimal('159.25')
        assert result.excess_emissions == Decimal('4840.75')
        assert result.credited_emissions == 0

    # def test_with_industrial_process_emissions(self):
    #     build_data = ComplianceTestInfrastructure.build()
    #     ComplianceTestInfrastructure.pare_data_remove_reporting_only()
    #     result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
    #     emissions = ReportEmission.objects.all()
    #     print(emissions)
    #     print('### RESULT ###')
    #     print(result.__dict__)

    # def test_compliance_summary_with_all_data(self):
    #     build_data = ComplianceTestInfrastructure.build()
    #     ## TESTS ##
    #     result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
    #     print('### RESULT ###')
    #     print(result.__dict__)
    #     print('### REG VALUES ###')
    #     print(result.regulatory_values.__dict__)
    #     print('### PRODUCTS ###')
    #     for p in result.products:
    #         print(p.__dict__)
