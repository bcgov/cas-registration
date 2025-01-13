from decimal import Decimal
from reporting.models.report_product import ReportProduct
from reporting.models.report import Report
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.models.report_emission import ReportEmission
from registration.models.operation import Operation
from reporting.models.report_version import ReportVersion
from registration.models.naics_code import NaicsCode
from reporting.models.reporting_year import ReportingYear
from reporting.models.emission_category import EmissionCategory
from model_bakery.baker import make_recipe


class ComplianceTestInfrastructure:
    operation_1: Operation
    report_1: Report
    report_version_1: ReportVersion
    report_emission_1: ReportEmission
    report_emission_2: ReportEmission
    report_emission_3: ReportEmission
    report_product_1: ReportProduct
    report_product_2: ReportProduct
    report_product_3: ReportProduct
    allocation_1: ReportProductEmissionAllocation
    allocation_2: ReportProductEmissionAllocation
    allocation_3: ReportProductEmissionAllocation
    allocation_4: ReportProductEmissionAllocation
    allocation_5: ReportProductEmissionAllocation

    @classmethod
    def build(cls):
        t = ComplianceTestInfrastructure()
        t.operation_1 = make_recipe(
            'registration.tests.utils.operation',
            name='test sfo',
            naics_code=NaicsCode.objects.get(pk=1),
            type='Single Facility Operation',
        )
        t.report_1 = make_recipe(
            "reporting.tests.utils.report", operation=t.operation_1, reporting_year=ReportingYear.objects.get(pk=2024)
        )
        t.report_version_1 = make_recipe("reporting.tests.utils.report_version", report=t.report_1)
        t.report_emission_1 = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=t.report_version_1,
            gas_type_id=1,
            json_data={"equivalentEmission": 10000.0001},
        )
        t.report_emission_2 = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=t.report_version_1,
            gas_type_id=2,
            json_data={"equivalentEmission": 20000.9988},
        )
        t.report_emission_3 = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=t.report_version_1,
            gas_type_id=3,
            json_data={"equivalentEmission": 3000.05},
        )

        t.report_emission_1.emission_categories.set([1])
        t.report_emission_2.emission_categories.set([3])
        t.report_emission_3.emission_categories.set([4, 12])

        t.report_product_1 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=t.report_version_1,
            product_id=1,
            annual_production=Decimal('100000'),
            production_data_apr_dec=Decimal('50000'),
        )
        t.report_product_2 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=t.report_version_1,
            product_id=2,
            annual_production=Decimal('1000000'),
            production_data_apr_dec=Decimal('250000'),
        )
        t.report_product_3 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=t.report_version_1,
            product_id=3,
            annual_production=Decimal('2000000'),
            production_data_apr_dec=Decimal('1500000'),
        )

        t.allocation_1 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=t.report_version_1,
            report_product=t.report_product_1,
            emission_category=EmissionCategory.objects.get(pk=1),
            allocated_quantity=Decimal('10000.0001'),
        )
        t.allocation_2 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=t.report_version_1,
            emission_category=EmissionCategory.objects.get(pk=3),
            report_product=t.report_product_2,
            allocated_quantity=Decimal('10000.9900'),
        )
        t.allocation_3 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=t.report_version_1,
            emission_category=EmissionCategory.objects.get(pk=3),
            report_product=t.report_product_3,
            allocated_quantity=Decimal('10000.0088'),
        )
        t.allocation_4 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=t.report_version_1,
            emission_category=EmissionCategory.objects.get(pk=4),
            report_product=t.report_product_1,
            allocated_quantity=Decimal('3000.0005'),
        )
        t.allocation_5 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=t.report_version_1,
            emission_category=EmissionCategory.objects.get(pk=12),
            report_product=t.report_product_1,
            allocated_quantity=Decimal('3000.0005'),
        )

        return t

    @classmethod
    def pare_data_single_product_flaring(cls):
        # Pare down build data to data needed for this test
        ReportProductEmissionAllocation.objects.exclude(emission_category_id=1).delete()
        ReportProduct.objects.exclude(product_id=1).delete()
        ReportEmission.objects.exclude(gas_type_id=1).delete()

    @classmethod
    def pare_data_remove_reporting_only(cls):
        # Pare down build data to data needed for this test
        ReportProductEmissionAllocation.objects.filter(allocated_quantity='3000.0005').delete()
        ReportProduct.objects.exclude(product_id=1).delete()
        ReportEmission.objects.filter(gas_type_id=3).delete()

    @classmethod
    def reporting_year_2025(cls):
        reporting_year = make_recipe(
            "reporting.tests.utils.reporting_year",
            reporting_year=2025,
            reporting_window_start='2025-12-31 16:00:00-08',
            reporting_window_end='2026-12-31 16:00:00-08',
            report_due_data='2025-05-31 16:59:59.999-07',
        )
        report = Report.objects.get(reporting_year_id=2024)
        report.reporting_year = reporting_year
        report.save()
