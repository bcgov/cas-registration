from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.emission_category import EmissionCategory
from reporting.models.report import Report
from reporting.service.compliance_service import ComplianceService
from reporting.service.compliance_service.eafc_totals import (
    EafcEmissionRow,
    EafcTotals,
    _TermEmissions,
    get_eafc_totals,
    get_term_emissions,
)
from reporting.service.compliance_service.emission_allocation import UnregulatedProductAllocation
from reporting.tests.service.test_compliance_service.infrastructure import (
    REPORTING_REPORT_EMISSION_RECIPE_NAME,
    REPORTING_REPORT_PRODUCT_EMISSION_ALLOCATION_RECIPE_NAME,
    ComplianceTestInfrastructure,
)

MODULE = "reporting.service.compliance_service.eafc_totals"


class TestEafcTotals(TestCase):
    @patch(f"{MODULE}.get_allocated_to_unregulated_products")
    @patch(f"{MODULE}.get_term_emissions")
    def test_maps_and_rounds_each_term(self, mock_term_emissions: MagicMock, mock_unregulated: MagicMock):
        row_key = ("Activity", "Source type", None)

        def term(*amounts: str) -> _TermEmissions:
            emissions = _TermEmissions()
            for amount in amounts:
                emissions.add(row_key, Decimal(amount))
            return emissions

        mock_term_emissions.return_value = {
            "attributable_for_reporting": term("1000.00005"),
            "excluded_by_fuels": term("1", "2", "3"),
            "non_useful_venting": term("4"),
            "fugitive": term("5"),
            "remaining_npnc": term("6"),
        }
        mock_unregulated.return_value = [
            UnregulatedProductAllocation(product_name="A", allocated_emissions=Decimal("7")),
            UnregulatedProductAllocation(product_name="B", allocated_emissions=Decimal("14")),
        ]

        # 2025 rounding (half up): 1000.00005 -> 1000.0001
        assert get_eafc_totals(1, use_legacy_rounding=False) == EafcTotals(
            attributable_for_reporting=Decimal("1000.0001"),
            excluded_by_fuels=Decimal("6"),
            non_useful_venting=Decimal("4"),
            fugitive=Decimal("5"),
            remaining_npnc=Decimal("6"),
            # 7 + 14 allocated to unregulated products, less the 6 of remaining NPNC subtracted on its own line
            allocated_to_unregulated_products=Decimal("15"),
            annual_eafc=Decimal("964.0001"),
            attributable_for_reporting_rows=[
                EafcEmissionRow(
                    activity="Activity", source_type="Source type", fuel_name=None, emissions=Decimal("1000.0001")
                )
            ],
            excluded_by_fuels_rows=[
                EafcEmissionRow(activity="Activity", source_type="Source type", fuel_name=None, emissions=Decimal("6"))
            ],
            non_useful_venting_rows=[
                EafcEmissionRow(activity="Activity", source_type="Source type", fuel_name=None, emissions=Decimal("4"))
            ],
            fugitive_rows=[
                EafcEmissionRow(activity="Activity", source_type="Source type", fuel_name=None, emissions=Decimal("5"))
            ],
            remaining_npnc_rows=[
                EafcEmissionRow(activity="Activity", source_type="Source type", fuel_name=None, emissions=Decimal("6"))
            ],
            unregulated_product_rows=[
                UnregulatedProductAllocation(product_name="A", allocated_emissions=Decimal("7")),
                UnregulatedProductAllocation(product_name="B", allocated_emissions=Decimal("14")),
            ],
        )

        # 2024 legacy rounding (half even): 1000.00005 -> 1000.0000
        legacy = get_eafc_totals(1, use_legacy_rounding=True)
        assert legacy.attributable_for_reporting == Decimal("1000.0000")
        assert legacy.annual_eafc == Decimal("964.0000")

        mock_term_emissions.assert_called_with(1)
        mock_unregulated.assert_called_with(1)

    def test_annual_eafc_matches_compliance_calculation(self):
        # Annual (2025) report with fuel-excluded, fugitive, NPNC and unregulated product emissions
        build_data = ComplianceTestInfrastructure.unregulated_product_and_funny_category_13()
        Report.objects.filter(pk=build_data.report_1.id).update(reporting_year=2025)
        report_version = build_data.report_version_1

        # Fugitive emission allocated to a regulated product
        fugitive_emission = make_recipe(
            REPORTING_REPORT_EMISSION_RECIPE_NAME,
            report_version=report_version,
            gas_type_id=1,
            json_data={"equivalentEmission": 200.0002},
        )
        fugitive_emission.emission_categories.set([2])
        make_recipe(
            REPORTING_REPORT_PRODUCT_EMISSION_ALLOCATION_RECIPE_NAME,
            report_emission_allocation=build_data.report_emission_allocation,
            report_version=report_version,
            report_product=build_data.report_product_1,
            emission_category=EmissionCategory.objects.get(pk=2),
            allocated_quantity=Decimal("200.0002"),
        )

        # Flaring emission allocated to an unregulated product
        unregulated_emission = make_recipe(
            REPORTING_REPORT_EMISSION_RECIPE_NAME,
            report_version=report_version,
            gas_type_id=1,
            json_data={"equivalentEmission": 500.0005},
        )
        unregulated_emission.emission_categories.set([1])
        make_recipe(
            REPORTING_REPORT_PRODUCT_EMISSION_ALLOCATION_RECIPE_NAME,
            report_emission_allocation=build_data.report_emission_allocation,
            report_version=report_version,
            report_product=build_data.report_product_4,
            emission_category=EmissionCategory.objects.get(pk=1),
            allocated_quantity=Decimal("500.0005"),
        )

        # NPNC emission that is also fugitive: subtracted once, as fugitive
        npnc_fugitive_emission = make_recipe(
            REPORTING_REPORT_EMISSION_RECIPE_NAME,
            report_version=report_version,
            gas_type_id=1,
            json_data={"equivalentEmission": 70.0007},
        )
        npnc_fugitive_emission.emission_categories.set([2, 13])

        # NPNC emissions must be allocated to unregulated products, under their basic category
        for category_id, amount in [(5, "55.55"), (2, "70.0007")]:
            make_recipe(
                REPORTING_REPORT_PRODUCT_EMISSION_ALLOCATION_RECIPE_NAME,
                report_emission_allocation=build_data.report_emission_allocation,
                report_version=report_version,
                report_product=build_data.report_product_4,
                emission_category=EmissionCategory.objects.get(pk=category_id),
                allocated_quantity=Decimal(amount),
            )

        totals = get_eafc_totals(report_version.id, use_legacy_rounding=False)
        compliance_data = ComplianceService.get_calculated_compliance_data(report_version.id)

        assert totals.excluded_by_fuels == Decimal("3000.05")
        assert totals.fugitive == Decimal("270.0009")
        assert totals.remaining_npnc == Decimal("55.55")
        # 555.5505 allocated to the unregulated product, less the 55.55 of NPNC subtracted on its own line
        assert totals.allocated_to_unregulated_products == Decimal("500.0005")
        assert totals.annual_eafc == compliance_data.emissions_attributable_for_compliance

        # Each term's rows add up to the term
        def rows_total(rows: list[EafcEmissionRow]) -> Decimal:
            return sum((row.emissions for row in rows), Decimal("0"))

        assert rows_total(totals.attributable_for_reporting_rows) == totals.attributable_for_reporting
        assert rows_total(totals.excluded_by_fuels_rows) == totals.excluded_by_fuels
        assert rows_total(totals.fugitive_rows) == totals.fugitive
        assert rows_total(totals.remaining_npnc_rows) == totals.remaining_npnc
        assert totals.non_useful_venting_rows == []
        assert totals.unregulated_product_rows == [
            UnregulatedProductAllocation(
                product_name=build_data.report_product_4.product.name, allocated_emissions=Decimal("555.5505")
            )
        ]

    def test_term_emissions_are_grouped_by_activity_source_type_and_fuel(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        report_fuel = make_recipe("reporting.tests.utils.report_fuel", report_version=report_version)
        source_type = report_fuel.report_source_type

        def make_emission(amount: str, category_ids: list[int], **kwargs):
            emission = make_recipe(
                REPORTING_REPORT_EMISSION_RECIPE_NAME,
                report_version=report_version,
                gas_type_id=1,
                json_data={"equivalentEmission": amount},
                report_source_type=source_type,
                **kwargs,
            )
            emission.emission_categories.set(category_ids)

        # Same source type and fuel: one row
        make_emission("1.5", [1], report_fuel=report_fuel)
        make_emission("2.25", [1], report_fuel=report_fuel)
        # Same source type, no fuel: its own row
        make_emission("4", [1], report_fuel=None)
        # In two basic categories: counted once per category, matching the category totals
        make_emission("8", [1, 2], report_fuel=None)

        terms = get_term_emissions(report_version.id)

        activity = source_type.report_activity.activity.regulated_name
        source_type_name = source_type.source_type.name
        assert terms["attributable_for_reporting"].rows(lambda value: value) == [
            EafcEmissionRow(activity=activity, source_type=source_type_name, fuel_name=None, emissions=Decimal("20")),
            EafcEmissionRow(
                activity=activity,
                source_type=source_type_name,
                fuel_name=report_fuel.fuel_type.name,
                emissions=Decimal("3.75"),
            ),
        ]
        assert terms["fugitive"].total == Decimal("8")
        assert terms["excluded_by_fuels"].total == Decimal("0")

    def test_remaining_npnc_leaves_out_emissions_already_subtracted(self):
        report_version = make_recipe("reporting.tests.utils.report_version")

        def make_npnc_emission(amount: str, other_category_ids: list[int]):
            emission = make_recipe(
                REPORTING_REPORT_EMISSION_RECIPE_NAME,
                report_version=report_version,
                gas_type_id=1,
                json_data={"equivalentEmission": amount},
            )
            emission.emission_categories.set([13, *other_category_ids])

        make_npnc_emission("1", [5])
        # Already subtracted as excluded by fuels, fugitive or non-useful venting
        make_npnc_emission("10", [5, 10])
        make_npnc_emission("20", [5, 11])
        make_npnc_emission("30", [5, 12])
        make_npnc_emission("40", [2])
        make_npnc_emission("50", [7])

        terms = get_term_emissions(report_version.id)

        assert terms["remaining_npnc"].total == Decimal("1")
        assert terms["excluded_by_fuels"].total == Decimal("60")
        assert terms["fugitive"].total == Decimal("40")
        assert terms["non_useful_venting"].total == Decimal("50")
