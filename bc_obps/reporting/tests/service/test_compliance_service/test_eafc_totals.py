from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.emission_category import EmissionCategory
from reporting.models.report import Report
from reporting.service.compliance_service import ComplianceService
from reporting.service.compliance_service.eafc_totals import EafcTotals, get_eafc_totals
from reporting.service.compliance_service.emission_allocation import UnregulatedProductAllocation
from reporting.tests.service.test_compliance_service.infrastructure import (
    REPORTING_REPORT_EMISSION_RECIPE_NAME,
    REPORTING_REPORT_PRODUCT_EMISSION_ALLOCATION_RECIPE_NAME,
    ComplianceTestInfrastructure,
)

MODULE = "reporting.service.compliance_service.eafc_totals"


class TestEafcTotals(TestCase):
    @patch(f"{MODULE}.get_allocated_to_unregulated_products")
    @patch(f"{MODULE}.get_emissions_from_only_funny_category_13")
    @patch(f"{MODULE}.EmissionCategoryService.get_all_category_totals_by_version")
    def test_maps_and_rounds_each_term(
        self, mock_category_totals: MagicMock, mock_category_13: MagicMock, mock_unregulated: MagicMock
    ):
        mock_category_totals.return_value = {
            "attributable_for_reporting": Decimal("1000.00005"),
            "woody_biomass": Decimal("1"),
            "excluded_biomass": Decimal("2"),
            "excluded_non_biomass": Decimal("3"),
            "venting_non_useful": Decimal("4"),
            "fugitive": Decimal("5"),
        }
        mock_category_13.return_value = Decimal("6")
        mock_unregulated.return_value = [
            UnregulatedProductAllocation(product_name="A", allocated_emissions=Decimal("7")),
            UnregulatedProductAllocation(product_name="B", allocated_emissions=Decimal("8")),
        ]

        # 2025+ rounding (half up): 1000.00005 -> 1000.0001
        assert get_eafc_totals(1, use_legacy_rounding=False) == EafcTotals(
            attributable_for_reporting=Decimal("1000.0001"),
            excluded_by_fuels=Decimal("6"),
            non_useful_venting=Decimal("4"),
            fugitive=Decimal("5"),
            remaining_npnc=Decimal("6"),
            allocated_to_unregulated_products=Decimal("15"),
            annual_eafc=Decimal("964.0001"),
        )

        # 2024 legacy rounding (half even): 1000.00005 -> 1000.0000
        legacy = get_eafc_totals(1, use_legacy_rounding=True)
        assert legacy.attributable_for_reporting == Decimal("1000.0000")
        assert legacy.annual_eafc == Decimal("964.0000")

        mock_category_totals.assert_called_with(1)
        mock_category_13.assert_called_with(1)
        mock_unregulated.assert_called_with(1)

    def test_annual_eafc_matches_compliance_calculation(self):
        # Annual (2025) report with fuel-excluded, fugitive, category 13 only and unregulated product emissions
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

        totals = get_eafc_totals(report_version.id, use_legacy_rounding=False)
        compliance_data = ComplianceService.get_calculated_compliance_data(report_version.id)

        assert totals.excluded_by_fuels == Decimal("3000.05")
        assert totals.fugitive == Decimal("200.0002")
        assert totals.remaining_npnc == Decimal("55.55")
        assert totals.allocated_to_unregulated_products == Decimal("500.0005")
        assert totals.annual_eafc == compliance_data.emissions_attributable_for_compliance
