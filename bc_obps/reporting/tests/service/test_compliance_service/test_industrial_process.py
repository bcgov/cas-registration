from decimal import Decimal
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.emission_category import EmissionCategory
from reporting.service.compliance_service.industrial_process import (
    get_allocated_emissions_by_report_product_emission_category,
)


class TestIndustrialProcess(TestCase):
    """
    Test cases for the industrial process emissions piece of the compliance summary.
    This ensures Naics Regulatory overrides are applied properly when necessary
    """

    def test_get_allocated_emissions_by_report_product_emission_category(self):
        ## SETUP ##
        emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
        )
        allocation_1 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(pk=1),
            allocated_quantity=Decimal("1000.0001"),
        )
        allocation_2 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(pk=1),
            report_product=allocation_1.report_product,
            allocated_quantity=Decimal("2000.0002"),
        )
        allocation_3 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(pk=3),
            allocated_quantity=Decimal("6000.0006"),
        )
        allocation_4 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(pk=12),
            report_product=allocation_3.report_product,
            allocated_quantity=Decimal("500.0005"),
        )

        ## TESTS ##
        allocated_to_flaring_for_test = get_allocated_emissions_by_report_product_emission_category(
            allocation_1.report_version_id, allocation_1.report_product.product_id, [1]
        )
        allocated_to_industrial_for_test = get_allocated_emissions_by_report_product_emission_category(
            allocation_3.report_version_id, allocation_3.report_product.product_id, [3]
        )
        allocated_to_excluded_non_biomass_for_test = get_allocated_emissions_by_report_product_emission_category(
            allocation_4.report_version_id, allocation_4.report_product.product_id, [12]
        )
        assert allocated_to_flaring_for_test == allocation_1.allocated_quantity + allocation_2.allocated_quantity
        assert allocated_to_industrial_for_test == allocation_3.allocated_quantity
        assert allocated_to_excluded_non_biomass_for_test == allocation_4.allocated_quantity
