from decimal import Decimal
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.emission_category import EmissionCategory
from reporting.service.compliance_service.industrial_process import compute_industrial_process_emissions


class TestIndustrialProcess(TestCase):
    """
    Test cases for the industrial process emissions piece of the compliance summary.
    This ensures Naics Regulatory overrides are applied properly when necessary
    """

    def test_retrieve_biogenic_emissions_split(self):

        raise NotImplementedError("Test will be implemented when #965 is done")

    def test_compute_industrial_process_emissions(self):
        ## SETUP ##
        emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
        )
        product_emission_allocation_no_pnp = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            allocated_quantity=Decimal("6000.0006"),
        )
        product_emission_allocation_chemical_pulp = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            allocated_quantity=Decimal("6000.0006"),
        )
        product_emission_allocation_lime_recovered_by_kiln = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            allocated_quantity=Decimal("6000.0006"),
        )

        ## TESTS ##
        industrial_process_no_pnp = compute_industrial_process_emissions(product_emission_allocation_no_pnp)
        industrial_process_chem_pulp = compute_industrial_process_emissions(product_emission_allocation_chemical_pulp)
        industrial_process_lime_recov_by_kiln = compute_industrial_process_emissions(
            product_emission_allocation_lime_recovered_by_kiln
        )

        assert industrial_process_no_pnp == Decimal(123)
        assert industrial_process_chem_pulp == Decimal(3456)
        assert industrial_process_lime_recov_by_kiln == Decimal(3456)
