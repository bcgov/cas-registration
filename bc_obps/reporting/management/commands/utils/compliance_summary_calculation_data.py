from decimal import Decimal
from django.db import transaction
from registration.models import Operation
from reporting.constants import (
    FLARING_CATEGORY_ID,
    FUEL_EXCLUDED_BIOMASS_CATEGORY_ID,
    FUGITIVE_CATEGORY_ID,
    NON_USEFUL_VENTING_CATEGORY_ID,
    NPNC_CATEGORY_ID,
    STATIONARY_COMBUSTION_CATEGORY_ID,
)
from reporting.models import (
    ReportActivity,
    ReportEmission,
    ReportEmissionAllocation,
    ReportFuel,
    ReportProduct,
    ReportProductEmissionAllocation,
    ReportSourceType,
    ReportUnit,
    ReportVersion,
)
from service.report_service import ReportService

SUFFIX = " - name from admin"
GSC_UNIT_NAME = "GSC Unit 1"


def _strip_admin_suffix(value: str | None) -> str | None:
    if value is None:
        return None
    return value.replace(SUFFIX, "").strip()


@transaction.atomic
def seed_compliance_summary_calculation_data() -> None:
    """
    Seeds mock data dynamically for the compliance summary calculation E2E tests
    """
    # Report 11: Bullet LFO (2025, New Entrant Operation)
    bullet_op = Operation.objects.get(name__icontains="Bullet LFO")
    bullet_rv_id = ReportService.create_report(
        operation_id=bullet_op.id,
        reporting_year=2025,
    )
    bullet_rv = ReportVersion.objects.get(id=bullet_rv_id)
    bullet_ro = bullet_rv.report_operation
    bullet_ro.operator_legal_name = _strip_admin_suffix(bullet_ro.operator_legal_name)
    bullet_ro.operation_name = _strip_admin_suffix(bullet_ro.operation_name)
    bullet_ro.save()

    # Report 12: Bin LFO (2025, Opted-in Operation with final reporting year 2025)
    bin_op = Operation.objects.get(name__icontains="Bin LFO")
    bin_rv_id = ReportService.create_report(
        operation_id=bin_op.id,
        reporting_year=2025,
    )
    bin_rv = ReportVersion.objects.get(id=bin_rv_id)
    bin_ro = bin_rv.report_operation
    bin_ro.operator_legal_name = _strip_admin_suffix(bin_ro.operator_legal_name)
    bin_ro.operation_name = _strip_admin_suffix(bin_ro.operation_name)
    bin_ro.registration_purpose = Operation.Purposes.OPTED_IN_OPERATION
    bin_ro.operation_opted_out_final_reporting_year = 2025
    bin_ro.save()

    bin_fr = bin_rv.facility_reports.first()
    _seed_report_12(bin_rv, bin_fr)

    # Report 8: Obligation not met 2024 (partial-year)
    rv_8 = ReportVersion.objects.get(id=8)
    fr_27 = rv_8.facility_reports.first()
    _seed_report_8(rv_8, fr_27)

    # Report 7: No obligation 2024 (all terms + unregulated product)
    rv_7 = ReportVersion.objects.get(id=7)
    fr_26 = rv_7.facility_reports.first()
    _seed_report_7(rv_7, fr_26)


def _seed_report_8(rv: ReportVersion, fr) -> None:
    ReportProductEmissionAllocation.objects.filter(report_version=rv).delete()
    ReportEmissionAllocation.objects.filter(report_version=rv).delete()
    ReportProduct.objects.filter(report_version=rv).delete()
    ReportEmission.objects.filter(report_version=rv).delete()
    ReportFuel.objects.filter(report_version=rv).delete()
    ReportUnit.objects.filter(report_version=rv).delete()
    ReportSourceType.objects.filter(report_version=rv).delete()
    ReportActivity.objects.filter(report_version=rv).delete()

    ra = ReportActivity.objects.create(
        report_version=rv,
        facility_report=fr,
        activity_id=1,
        activity_base_schema_id=1,
        json_data={"gscWithProductionOfUsefulEnergy": True},
    )
    rst = ReportSourceType.objects.create(
        report_version=rv,
        report_activity=ra,
        source_type_id=1,
        activity_source_type_base_schema_id=1,
        json_data={},
    )
    ru = ReportUnit.objects.create(
        report_version=rv,
        report_source_type=rst,
        type="Unit",
        json_data={"gscUnitName": GSC_UNIT_NAME, "gscUnitType": "Boiler"},
    )
    rf = ReportFuel.objects.create(
        report_version=rv,
        report_source_type=rst,
        report_unit=ru,
        fuel_type_id=15,  # Diesel
        json_data={"fuelDescription": "Diesel", "annualFuelAmount": 11000},
    )
    re = ReportEmission.objects.create(
        report_version=rv,
        report_source_type=rst,
        report_fuel=rf,
        gas_type_id=1,
        json_data={"emission": 11000, "equivalentEmission": 11000.0},
    )
    re.emission_categories.add(STATIONARY_COMBUSTION_CATEGORY_ID)

    rp1 = ReportProduct.objects.create(
        report_version=rv,
        facility_report=fr,
        product_id=1,  # BC-specific refinery complexity throughput
        annual_production=20000,
        production_data_apr_dec=15000,
        production_methodology=ReportProduct.ProductionMethodologyChoices.OBPS_CALCULATOR,
    )
    rp2 = ReportProduct.objects.create(
        report_version=rv,
        facility_report=fr,
        product_id=2,  # Cement equivalent
        annual_production=1000,
        production_data_apr_dec=600,
        production_methodology=ReportProduct.ProductionMethodologyChoices.OBPS_CALCULATOR,
    )
    rea = ReportEmissionAllocation.objects.create(
        report_version=rv,
        facility_report=fr,
        allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
    )
    ReportProductEmissionAllocation.objects.create(
        report_version=rv,
        report_product=rp1,
        report_emission_allocation=rea,
        emission_category_id=STATIONARY_COMBUSTION_CATEGORY_ID,
        allocated_quantity=Decimal("10000.0000"),
    )
    ReportProductEmissionAllocation.objects.create(
        report_version=rv,
        report_product=rp2,
        report_emission_allocation=rea,
        emission_category_id=STATIONARY_COMBUSTION_CATEGORY_ID,
        allocated_quantity=Decimal("1000.0000"),
    )


def _seed_report_7(rv: ReportVersion, fr) -> None:
    ReportProductEmissionAllocation.objects.filter(report_version=rv).delete()
    ReportEmissionAllocation.objects.filter(report_version=rv).delete()
    ReportProduct.objects.filter(report_version=rv).delete()
    ReportEmission.objects.filter(report_version=rv).delete()
    ReportFuel.objects.filter(report_version=rv).delete()
    ReportUnit.objects.filter(report_version=rv).delete()
    ReportSourceType.objects.filter(report_version=rv).delete()
    ReportActivity.objects.filter(report_version=rv).delete()

    # Activity 1: GSC
    ra_gsc = ReportActivity.objects.create(
        report_version=rv,
        facility_report=fr,
        activity_id=1,
        activity_base_schema_id=1,
        json_data={"gscWithProductionOfUsefulEnergy": True},
    )
    rst_gsc = ReportSourceType.objects.create(
        report_version=rv,
        report_activity=ra_gsc,
        source_type_id=1,
        activity_source_type_base_schema_id=1,
        json_data={},
    )
    ru_gsc = ReportUnit.objects.create(
        report_version=rv,
        report_source_type=rst_gsc,
        type="Unit",
        json_data={"gscUnitName": GSC_UNIT_NAME, "gscUnitType": "Boiler"},
    )
    rf_cto = ReportFuel.objects.create(
        report_version=rv,
        report_source_type=rst_gsc,
        report_unit=ru_gsc,
        fuel_type_id=11,  # Combustible Tall Oil
        json_data={"fuelDescription": "Combustible Tall Oil", "annualFuelAmount": 1000},
    )
    re_cto = ReportEmission.objects.create(
        report_version=rv,
        report_source_type=rst_gsc,
        report_fuel=rf_cto,
        gas_type_id=1,
        json_data={"emission": 3000, "equivalentEmission": 3000.0},
    )
    re_cto.emission_categories.add(STATIONARY_COMBUSTION_CATEGORY_ID, FUEL_EXCLUDED_BIOMASS_CATEGORY_ID)

    rf_diesel = ReportFuel.objects.create(
        report_version=rv,
        report_source_type=rst_gsc,
        report_unit=ru_gsc,
        fuel_type_id=15,  # Diesel
        json_data={"fuelDescription": "Diesel", "annualFuelAmount": 20000},
    )
    re_diesel = ReportEmission.objects.create(
        report_version=rv,
        report_source_type=rst_gsc,
        report_fuel=rf_diesel,
        gas_type_id=1,
        json_data={"emission": 20000, "equivalentEmission": 20000.0},
    )
    re_diesel.emission_categories.add(STATIONARY_COMBUSTION_CATEGORY_ID)

    # Activity 32: Oil and Gas Non-compression
    ra_og = ReportActivity.objects.create(
        report_version=rv,
        facility_report=fr,
        activity_id=32,
        activity_base_schema_id=1,
        json_data={},
    )
    # Source Type 66: Associated gas flaring
    rst_flaring = ReportSourceType.objects.create(
        report_version=rv,
        report_activity=ra_og,
        source_type_id=66,
        activity_source_type_base_schema_id=1,
        json_data={},
    )
    ru_flaring = ReportUnit.objects.create(
        report_version=rv,
        report_source_type=rst_flaring,
        type="Unit",
        json_data={"unitName": "Flare 1"},
    )
    rf_ng = ReportFuel.objects.create(
        report_version=rv,
        report_source_type=rst_flaring,
        report_unit=ru_flaring,
        fuel_type_id=37,  # Natural Gas
        json_data={"fuelDescription": "Natural Gas", "annualFuelAmount": 2500},
    )
    re_flaring = ReportEmission.objects.create(
        report_version=rv,
        report_source_type=rst_flaring,
        report_fuel=rf_ng,
        gas_type_id=1,
        json_data={"emission": 2500, "equivalentEmission": 2500.0},
    )
    re_flaring.emission_categories.add(FLARING_CATEGORY_ID, NPNC_CATEGORY_ID)

    # Source Type 62: Dehydrator venting
    rst_venting = ReportSourceType.objects.create(
        report_version=rv,
        report_activity=ra_og,
        source_type_id=62,
        activity_source_type_base_schema_id=1,
        json_data={},
    )
    re_venting = ReportEmission.objects.create(
        report_version=rv,
        report_source_type=rst_venting,
        report_fuel=None,
        gas_type_id=1,
        json_data={"emission": 1500, "equivalentEmission": 1500.0},
    )
    re_venting.emission_categories.add(NON_USEFUL_VENTING_CATEGORY_ID)

    # Source Type 77: Other fugitive sources
    rst_fugitive = ReportSourceType.objects.create(
        report_version=rv,
        report_activity=ra_og,
        source_type_id=77,
        activity_source_type_base_schema_id=1,
        json_data={},
    )
    re_fugitive = ReportEmission.objects.create(
        report_version=rv,
        report_source_type=rst_fugitive,
        report_fuel=None,
        gas_type_id=1,
        json_data={"emission": 800, "equivalentEmission": 800.0},
    )
    re_fugitive.emission_categories.add(FUGITIVE_CATEGORY_ID)

    # Products
    rp_reg = ReportProduct.objects.create(
        report_version=rv,
        facility_report=fr,
        product_id=21,  # Renewable diesel
        annual_production=10000,
        production_data_apr_dec=7500,
        production_methodology=ReportProduct.ProductionMethodologyChoices.OBPS_CALCULATOR,
    )
    rp_unreg = ReportProduct.objects.create(
        report_version=rv,
        facility_report=fr,
        product_id=38,  # Oil and gas non-processing, non-compression
        annual_production=100,
        production_data_apr_dec=100,
        production_methodology=ReportProduct.ProductionMethodologyChoices.OBPS_CALCULATOR,
    )
    rea = ReportEmissionAllocation.objects.create(
        report_version=rv,
        facility_report=fr,
        allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
    )
    ReportProductEmissionAllocation.objects.create(
        report_version=rv,
        report_product=rp_reg,
        report_emission_allocation=rea,
        emission_category_id=STATIONARY_COMBUSTION_CATEGORY_ID,
        allocated_quantity=Decimal("18000.0000"),
    )
    ReportProductEmissionAllocation.objects.create(
        report_version=rv,
        report_product=rp_unreg,
        report_emission_allocation=rea,
        emission_category_id=STATIONARY_COMBUSTION_CATEGORY_ID,
        allocated_quantity=Decimal("4500.0000"),
    )


def _seed_report_12(rv: ReportVersion, fr) -> None:
    ReportProductEmissionAllocation.objects.filter(report_version=rv).delete()
    ReportEmissionAllocation.objects.filter(report_version=rv).delete()
    ReportProduct.objects.filter(report_version=rv).delete()
    ReportEmission.objects.filter(report_version=rv).delete()
    ReportFuel.objects.filter(report_version=rv).delete()
    ReportUnit.objects.filter(report_version=rv).delete()
    ReportSourceType.objects.filter(report_version=rv).delete()
    ReportActivity.objects.filter(report_version=rv).delete()

    ra = ReportActivity.objects.create(
        report_version=rv,
        facility_report=fr,
        activity_id=1,
        activity_base_schema_id=1,
        json_data={"gscWithProductionOfUsefulEnergy": True},
    )
    rst = ReportSourceType.objects.create(
        report_version=rv,
        report_activity=ra,
        source_type_id=1,
        activity_source_type_base_schema_id=1,
        json_data={},
    )
    ru = ReportUnit.objects.create(
        report_version=rv,
        report_source_type=rst,
        type="Unit",
        json_data={"gscUnitName": GSC_UNIT_NAME, "gscUnitType": "Boiler"},
    )
    rf = ReportFuel.objects.create(
        report_version=rv,
        report_source_type=rst,
        report_unit=ru,
        fuel_type_id=15,  # Diesel
        json_data={"fuelDescription": "Diesel", "annualFuelAmount": 12000},
    )
    re = ReportEmission.objects.create(
        report_version=rv,
        report_source_type=rst,
        report_fuel=rf,
        gas_type_id=1,
        json_data={"emission": 12000, "equivalentEmission": 12000.0},
    )
    re.emission_categories.add(STATIONARY_COMBUSTION_CATEGORY_ID)

    rp = ReportProduct.objects.create(
        report_version=rv,
        facility_report=fr,
        product_id=2,  # Cement equivalent
        annual_production=4000,
        production_data_jan_mar=1000,
        production_methodology=ReportProduct.ProductionMethodologyChoices.OBPS_CALCULATOR,
    )
    rea = ReportEmissionAllocation.objects.create(
        report_version=rv,
        facility_report=fr,
        allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
    )
    ReportProductEmissionAllocation.objects.create(
        report_version=rv,
        report_product=rp,
        report_emission_allocation=rea,
        emission_category_id=STATIONARY_COMBUSTION_CATEGORY_ID,
        allocated_quantity=Decimal("12000.0000"),
    )
