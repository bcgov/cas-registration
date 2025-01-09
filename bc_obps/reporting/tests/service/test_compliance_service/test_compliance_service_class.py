from django.test import TestCase
from reporting.models.report_emission import ReportEmission
from reporting.models.report_product import ReportProduct
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.service.compliance_service import ComplianceService
from infrastructure import ComplianceTestInfrastructure


class TestComplianceSummaryServiceClass(TestCase):
    def test_compliance_summary_only_flaring_single_product(self):
        build_data = ComplianceTestInfrastructure.build()
        # Pare down build data to data needed for this test
        ReportProductEmissionAllocation.objects.exclude(emission_category_id=1).delete()
        ReportProduct.objects.exclude(product_id=1).delete()
        ReportEmission.objects.exclude(gas_type_id=1).delete()

        result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
        emissions = ReportEmission.objects.all()
        print(emissions)
        print('### RESULT ###')
        print(result.__dict__)
        # print('### REG VALUES ###')
        # print (result.regulatory_values.__dict__)
        # print('### PRODUCTS ###')
        # for p in result.products:
        #   print (p.__dict__)

    # def test_compliance_summary_with_all_data(self):
    #     build_data = ComplianceTestInfrastructure.build()
    #     ## SETUP ##
    #     # operation_1 = make_recipe(
    #     #     'registration.tests.utils.operation',
    #     #     name='test sfo',
    #     #     naics_code=NaicsCode.objects.get(pk=1),
    #     #     type='Single Facility Operation'
    #     # )
    #     # report_1 = make_recipe(
    #     #     "reporting.tests.utils.report",
    #     #     operation=operation_1,
    #     #     reporting_year=ReportingYear.objects.get(pk=2024)
    #     # )
    #     # report_version_1 = make_recipe(
    #     #     "reporting.tests.utils.report_version",
    #     #     report=report_1
    #     # )
    #     # report_emission_1 = make_recipe(
    #     #     "reporting.tests.utils.report_emission",
    #     #     report_version=report_version_1,
    #     #     json_data={"equivalentEmission": 10000.0001},
    #     # )
    #     # report_emission_2 = make_recipe(
    #     #     "reporting.tests.utils.report_emission",
    #     #     report_version=report_version_1,
    #     #     json_data={"equivalentEmission": 20000.9988},
    #     # )
    #     # report_emission_3 = make_recipe(
    #     #     "reporting.tests.utils.report_emission",
    #     #     report_version=report_version_1,
    #     #     json_data={"equivalentEmission": 3000.05},
    #     # )

    #     # report_emission_1.emission_categories.set([1])
    #     # report_emission_2.emission_categories.set([3])
    #     # report_emission_3.emission_categories.set([4, 12])

    #     # report_product_1 = make_recipe(
    #     #     "reporting.tests.utils.report_product",
    #     #     report_version=report_version_1,
    #     #     product_id=1,
    #     #     annual_production=Decimal('100000'),
    #     #     production_data_apr_dec=Decimal('50000'),
    #     # )
    #     # report_product_2 = make_recipe(
    #     #     "reporting.tests.utils.report_product",
    #     #     report_version=report_version_1,
    #     #     product_id=2,
    #     #     annual_production=Decimal('1000000'),
    #     #     production_data_apr_dec=Decimal('250000'),
    #     # )
    #     # report_product_3 = make_recipe(
    #     #     "reporting.tests.utils.report_product",
    #     #     report_version=report_version_1,
    #     #     product_id=3,
    #     #     annual_production=Decimal('2000000'),
    #     #     production_data_apr_dec=Decimal('1500000'),
    #     # )

    #     # make_recipe(
    #     #     "reporting.tests.utils.report_product_emission_allocation",
    #     #     report_version=report_version_1,
    #     #     report_product=report_product_1,
    #     #     emission_category=EmissionCategory.objects.get(pk=1),
    #     #     allocated_quantity=Decimal('10000.0001'),
    #     # )
    #     # make_recipe(
    #     #     "reporting.tests.utils.report_product_emission_allocation",
    #     #     report_version=report_version_1,
    #     #     emission_category=EmissionCategory.objects.get(pk=3),
    #     #     report_product=report_product_2,
    #     #     allocated_quantity=Decimal('10000.9900'),
    #     # )
    #     # make_recipe(
    #     #     "reporting.tests.utils.report_product_emission_allocation",
    #     #     report_version=report_version_1,
    #     #     emission_category=EmissionCategory.objects.get(pk=3),
    #     #     report_product=report_product_3,
    #     #     allocated_quantity=Decimal('10000.0088'),
    #     # )
    #     # make_recipe(
    #     #     "reporting.tests.utils.report_product_emission_allocation",
    #     #     report_version=report_version_1,
    #     #     emission_category=EmissionCategory.objects.get(pk=4),
    #     #     report_product=report_product_1,
    #     #     allocated_quantity=Decimal('3000.0005'),
    #     # )
    #     # make_recipe(
    #     #     "reporting.tests.utils.report_product_emission_allocation",
    #     #     report_version=report_version_1,
    #     #     emission_category=EmissionCategory.objects.get(pk=12),
    #     #     report_product=report_product_1,
    #     #     allocated_quantity=Decimal('3000.0005'),
    #     # )

    #     ## TESTS ##

    #     result = ComplianceService.get_calculated_compliance_data(build_data.report_version_1.id)
    #     print('### RESULT ###')
    #     print (result.__dict__)
    #     print('### REG VALUES ###')
    #     print (result.regulatory_values.__dict__)
    #     print('### PRODUCTS ###')
    #     for p in result.products:
    #       print (p.__dict__)
